'use client';

interface MeetingTitleInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export default function MeetingTitleInput({ 
  value, 
  onChange, 
  placeholder = "예: 팀 회식, 동창 모임",
  disabled = false,
  label = "약속 이름"
}: MeetingTitleInputProps) {
  return (
    <div>
      <label className="text-sm text-gray-800 font-medium block mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border rounded-lg outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}