'use client';

import { useEffect, useState, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AboutModal from '@/components/AboutModal';
import MeetingStructuredData from '@/components/MeetingStructuredData';
import ShareModal from '@/components/ShareModal';
import EditMeetingModal from '@/components/EditMeetingModal';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import { useTranslation } from '@/lib/useTranslation';
import { DATE_COLUMN_COLORS } from '@/lib/constants/colors';
import { useMeetingData } from '@/hooks/useMeetingData';
import { useMeetingActions } from '@/hooks/useMeetingActions';
import { useMeetingGrid } from '@/hooks/useMeetingGrid';
import { useScrollManager } from '@/hooks/useScrollManager';
import { useToast } from '@/hooks/useToast';
import {
  DateCell,
  StatusCell,
  ParticipantHeader,
  MonthSeparator,
  HeaderCorner,
} from '@/components/MeetingGrid/GridCell';
import { FloatingActionButton } from '@/components/MeetingGrid/FloatingActionButton';
import { TopDatesIndicator } from '@/components/MeetingGrid/TopDatesIndicator';
import { AddParticipantInput } from '@/components/MeetingGrid/AddParticipantInput';

type ParticipantStatus = 'available' | 'unavailable' | 'undecided';

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const resolvedParams = use(params);
  const router = useRouter();

  // Toast state
  const { toastMessage, toastType, showToast, hideToast } = useToast();

  // Use refs to avoid dependency issues in callbacks
  const showToastRef = useRef(showToast);
  const tRef = useRef(t);
  const routerRef = useRef(router);
  showToastRef.current = showToast;
  tRef.current = t;
  routerRef.current = router;

  // Error handler for meeting data (stable reference)
  const handleMeetingError = useCallback(() => {
    showToastRef.current(tRef.current('meeting.alerts.notFound'), 'error');
    routerRef.current.push('/');
  }, []);

  // Meeting data and state
  const {
    meeting,
    availabilities,
    isLoading,
    lockedParticipants,
    setLockedParticipants,
    fetchMeetingData,
    availabilityMap,
    allParticipants,
  } = useMeetingData({
    meetingId: resolvedParams.id,
    onError: handleMeetingError,
  });

  // Scroll management
  const {
    scrollContainerRef,
    currentMonth,
    datePositions,
    scrollTop,
    clientHeight,
    highlightedDate,
    scrollToDate,
  } = useScrollManager({ meeting });

  // Grid data calculation
  const { gridData, topDates } = useMeetingGrid({
    meeting,
    availabilities,
    availabilityMap,
    allParticipants,
    currentMonth,
    t,
  });

  // Meeting actions with useCallback
  const { handleAddParticipant, handleStatusClick, handleToggleLock, handleUpdateMeeting } =
    useMeetingActions({
      meetingId: resolvedParams.id,
      availabilities,
      setAvailabilities: () => {}, // Will be handled differently
      lockedParticipants,
      setLockedParticipants,
      fetchMeetingData,
      onError: (message) => showToast(message, 'error'),
      t,
    });

  // UI state
  const [showAddInput, setShowAddInput] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDates, setEditingDates] = useState<string[]>([]);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingParticipants, setEditingParticipants] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNewMeetingConfirm, setShowNewMeetingConfirm] = useState(false);

  // Initial data fetch - only on mount
  useEffect(() => {
    fetchMeetingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  // Load current data when opening edit modal
  useEffect(() => {
    if (showEditModal && meeting) {
      setEditingDates(meeting.dates);
      setEditingTitle(meeting.title);
      setEditingParticipants(allParticipants);
    }
  }, [showEditModal, meeting, allParticipants]);

  // Optimistic status update handler
  const handleOptimisticStatusClick = useCallback(
    async (participant: string, date: string, currentStatus: ParticipantStatus) => {
      await handleStatusClick(participant, date, currentStatus);
      await fetchMeetingData(true);
    },
    [handleStatusClick, fetchMeetingData]
  );

  // Add participant handler
  const handleAddParticipantSubmit = useCallback(async () => {
    if (!newParticipantName.trim()) {
      showToastRef.current(tRef.current('meeting.alerts.enterName'), 'warning');
      return;
    }

    if (newParticipantName.trim().length > 10) {
      showToastRef.current(tRef.current('meeting.alerts.nameTooLong'), 'warning');
      return;
    }

    setIsSubmitting(true);
    const success = await handleAddParticipant(newParticipantName.trim());
    if (success) {
      setNewParticipantName('');
    }
    setIsSubmitting(false);
  }, [newParticipantName, handleAddParticipant]);

  // Update meeting handler
  const handleUpdateDates = useCallback(async () => {
    if (!meeting || editingDates.length === 0) {
      showToastRef.current(tRef.current('meeting.alerts.selectDates'), 'warning');
      return;
    }

    if (!editingTitle.trim()) {
      showToastRef.current(tRef.current('meeting.alerts.enterTitle'), 'warning');
      return;
    }

    setIsUpdating(true);
    const success = await handleUpdateMeeting(editingTitle, editingDates, editingParticipants);
    if (success) {
      setShowEditModal(false);
      showToastRef.current(tRef.current('meeting.edit.updateSuccess'), 'success');
    }
    setIsUpdating(false);
  }, [meeting, editingDates, editingTitle, editingParticipants, handleUpdateMeeting]);

  // Share handlers
  const handleShareLink = useCallback(() => {
    const meetingUrl = `${window.location.origin}/meeting/${resolvedParams.id}`;
    navigator.clipboard.writeText(meetingUrl);
    showToastRef.current(tRef.current('meeting.toast.linkCopied'), 'success');
  }, [resolvedParams.id]);

  const handleShareTemplate = useCallback(() => {
    if (!meeting) return;

    const templateUrl = new URL('/', window.location.origin);
    templateUrl.searchParams.set('title', meeting.title);
    if (allParticipants.length > 0) {
      templateUrl.searchParams.set('participants', allParticipants.join(','));
    }

    navigator.clipboard.writeText(templateUrl.toString());
    showToastRef.current(tRef.current('meeting.toast.templateCopied'), 'success');
  }, [meeting, allParticipants]);

  const handleShareTemplateFromEditModal = useCallback(async () => {
    const templateUrl = new URL('/', window.location.origin);
    templateUrl.searchParams.set('title', editingTitle);
    if (editingParticipants.length > 0) {
      templateUrl.searchParams.set('participants', editingParticipants.join(','));
    }
    await navigator.clipboard.writeText(templateUrl.toString());
    showToastRef.current(tRef.current('meeting.toast.shareTemplateCopied'), 'success');
  }, [editingTitle, editingParticipants]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Structured Data for SEO */}
      <MeetingStructuredData
        meeting={meeting}
        participantCount={availabilities.length}
        topDate={topDates[0] ? { date: topDates[0].date, count: topDates[0].count } : undefined}
      />

      {/* Header */}
      <div className="flex-shrink-0 bg-gray-50">
        <div className="flex">
          <div className={DATE_COLUMN_COLORS.bg} style={{ minWidth: '50px', maxWidth: 'min-content' }} />
          <div className="flex-1 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-gray-800">
                {meeting.title} - {availabilities.length}
                {t('meeting.participantCount')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AddParticipantInput
                showInput={showAddInput}
                inputValue={newParticipantName}
                isSubmitting={isSubmitting}
                onShowInput={() => setShowAddInput(true)}
                onHideInput={() => {
                  setShowAddInput(false);
                  setNewParticipantName('');
                }}
                onInputChange={setNewParticipantName}
                onSubmit={handleAddParticipantSubmit}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 relative overflow-hidden" style={{ isolation: 'isolate' }}>
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-auto overscroll-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            contain: 'layout',
            touchAction: 'pan-x pan-y',
          }}
        >
          <div
            className="meeting-grid-container"
            style={{
              gridTemplateColumns: `minmax(50px, min-content) ${allParticipants.map(() => 'var(--col-width)').join(' ')}`,
              ['--col-width' as string]: 'clamp(90px, 10vw, 120px)',
              position: 'relative',
              paddingBottom: '100px',
            } as React.CSSProperties}
          >
            {gridData.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;

                if (cell.type === 'month-separator') {
                  return (
                    <MonthSeparator
                      key={key}
                      content={cell.content || ''}
                      isFirst={colIndex === 0}
                    />
                  );
                }

                if (cell.type === 'header-corner') {
                  return <HeaderCorner key={key} content={cell.content || ''} />;
                }

                if (cell.type === 'header-participant') {
                  return (
                    <ParticipantHeader
                      key={key}
                      name={cell.content || ''}
                      isLocked={lockedParticipants.has(cell.participant || '')}
                      onToggleLock={handleToggleLock}
                    />
                  );
                }

                if (cell.type === 'date') {
                  const topDateInfo = topDates.find((td) => td.date === cell.date);
                  return (
                    <DateCell
                      key={key}
                      date={cell.date || ''}
                      content={cell.content || ''}
                      month={cell.month || ''}
                      highlightedDate={highlightedDate}
                      topDateInfo={topDateInfo ? { rank: topDateInfo.rank as 1 | 2 | 3 } : undefined}
                    />
                  );
                }

                if (cell.type === 'status') {
                  return (
                    <StatusCell
                      key={key}
                      status={cell.status!}
                      participant={cell.participant || ''}
                      date={cell.date || ''}
                      isLocked={lockedParticipants.has(cell.participant || '')}
                      onStatusClick={handleOptimisticStatusClick}
                      t={t}
                    />
                  );
                }

                return null;
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Dates Indicator */}
      <TopDatesIndicator
        topDates={topDates}
        datePositions={datePositions}
        scrollTop={scrollTop}
        clientHeight={clientHeight}
        onDateClick={scrollToDate}
        t={t}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        isOpen={showFabMenu}
        onToggle={() => setShowFabMenu(!showFabMenu)}
        onShareClick={() => {
          setShowShareModal(true);
          setShowFabMenu(false);
        }}
        onEditClick={() => {
          setShowEditModal(true);
          setShowFabMenu(false);
        }}
        onNewMeetingClick={() => {
          setShowNewMeetingConfirm(true);
          setShowFabMenu(false);
        }}
        onInfoClick={() => {
          setShowCreatorModal(true);
          setShowFabMenu(false);
        }}
        t={t}
      />

      {/* Modals */}
      <EditMeetingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={editingTitle}
        setTitle={setEditingTitle}
        participants={editingParticipants}
        setParticipants={setEditingParticipants}
        dates={editingDates}
        setDates={setEditingDates}
        isUpdating={isUpdating}
        onUpdate={handleUpdateDates}
        onShareTemplate={handleShareTemplateFromEditModal}
        onShowToast={showToast}
      />

      {showCreatorModal && <AboutModal onClose={() => setShowCreatorModal(false)} />}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onShareLink={handleShareLink}
          onShareTemplate={handleShareTemplate}
        />
      )}

      <ConfirmModal
        isOpen={showNewMeetingConfirm}
        onClose={() => setShowNewMeetingConfirm(false)}
        title={t('meeting.newMeeting.title')}
        message={t('meeting.newMeeting.message')}
        confirmText={t('meeting.newMeeting.confirm')}
        confirmLink={
          allParticipants.length > 0
            ? `/?participants=${encodeURIComponent(allParticipants.join(','))}`
            : '/'
        }
        confirmLinkNewTab={true}
        type="info"
      />

      {/* Toast */}
      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={hideToast} />}
    </div>
  );
}
