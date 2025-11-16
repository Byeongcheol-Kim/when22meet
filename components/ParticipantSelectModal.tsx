'use client';

import { useState, useEffect } from 'react';
import { X, User, Users, Crown } from 'lucide-react';
import { useTranslation } from '@/lib/useTranslation';
import { UserRole } from '@/hooks/useCurrentUser';

interface ParticipantSelectModalProps {
  isOpen: boolean;
  participants: string[];
  onSelect: (participant: string, role: UserRole) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export default function ParticipantSelectModal({
  isOpen,
  participants,
  onSelect,
  onClose,
  canClose = false,
}: ParticipantSelectModalProps) {
  const { t } = useTranslation();
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('participant');

  useEffect(() => {
    if (isOpen) {
      setSelectedParticipant(null);
      setSelectedRole('participant');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRole === 'organizer') {
      onSelect('__organizer__', 'organizer');
    } else if (selectedParticipant) {
      onSelect(selectedParticipant, 'participant');
    }
  };

  const isConfirmEnabled = selectedRole === 'organizer' || selectedParticipant !== null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">{t('meeting.selectParticipant.title')}</h2>
          </div>
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
            {t('meeting.selectParticipant.description')}
          </p>

          <div className="space-y-2">
            {/* Organizer option */}
            <button
              onClick={() => {
                setSelectedRole('organizer');
                setSelectedParticipant(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                selectedRole === 'organizer'
                  ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedRole === 'organizer'
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Crown className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{t('meeting.selectParticipant.joinAsOrganizer')}</div>
              </div>
              {selectedRole === 'organizer' && (
                <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                  {t('meeting.selectParticipant.selected')}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">
                  {t('meeting.selectParticipant.participant')}
                </span>
              </div>
            </div>

            {/* Participant options */}
            {participants.map((participant) => (
              <button
                key={participant}
                onClick={() => {
                  setSelectedParticipant(participant);
                  setSelectedRole('participant');
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  selectedParticipant === participant && selectedRole === 'participant'
                    ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-100'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedParticipant === participant && selectedRole === 'participant'
                      ? 'bg-amber-500 text-amber-950'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">{participant}</span>
                {selectedParticipant === participant && selectedRole === 'participant' && (
                  <span className="ml-auto text-xs bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full">
                    {t('meeting.selectParticipant.selected')}
                  </span>
                )}
              </button>
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t('meeting.selectParticipant.noParticipants')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className={`w-full py-2.5 font-medium rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
              selectedRole === 'organizer'
                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                : 'bg-amber-500 text-amber-950 hover:bg-amber-600'
            }`}
          >
            {t('meeting.selectParticipant.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
