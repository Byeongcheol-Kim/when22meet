'use client';

import { memo } from 'react';
import { PlusCircle, Info, X, Menu, Pencil, Link } from 'lucide-react';

interface FloatingActionButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  onShareClick: () => void;
  onEditClick: () => void;
  onNewMeetingClick: () => void;
  onInfoClick: () => void;
  t: (key: string) => string;
}

export const FloatingActionButton = memo(function FloatingActionButton({
  isOpen,
  onToggle,
  onShareClick,
  onEditClick,
  onNewMeetingClick,
  onInfoClick,
  t,
}: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-1 flex flex-col gap-2 mb-2">
          <button
            onClick={onShareClick}
            className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
            title={t('meeting.fab.share')}
          >
            <Link className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onEditClick}
            className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
            title={t('meeting.edit.title')}
          >
            <Pencil className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onNewMeetingClick}
            className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
            title={t('meeting.fab.newMeeting')}
          >
            <PlusCircle className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onInfoClick}
            className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
            title={t('meeting.fab.info')}
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* Main FAB button */}
      <button
        onClick={onToggle}
        className={`w-12 h-12 bg-gray-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );
});
