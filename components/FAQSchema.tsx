export default function FAQSchema() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': '언제만나는 어떤 서비스인가요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '언제만나는 그룹 일정을 쉽게 조율할 수 있는 무료 스케줄링 서비스입니다. 로그인 없이 바로 사용할 수 있으며, 여러 날짜 중 참석 가능한 날짜를 표시하여 모임 시간을 정할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '회원가입이 필요한가요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '아니요, 회원가입이나 로그인 없이 바로 사용할 수 있습니다. 일정을 만들면 링크가 생성되고, 이 링크를 공유하여 참여자들을 초대할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '데이터는 얼마나 보관되나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '생성된 일정 데이터는 18개월 동안 보관됩니다. 이후 자동으로 삭제되므로 장기간 보관이 필요한 경우 스크린샷이나 캡처를 권장합니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '여러 날짜를 한 번에 선택하려면 어떻게 하나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '달력에서 마우스를 드래그하면 여러 날짜를 한 번에 선택할 수 있습니다. 또한 "빠른 선택" 버튼(주말, 주중, 금토일)을 사용하면 자동으로 해당 날짜들이 선택됩니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '참여자를 나중에 추가할 수 있나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '네, 일정 생성 시 참여자를 미리 지정하거나, 일정 화면에서 "참여자 추가" 버튼을 통해 언제든지 추가할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '참석 가능 여부는 어떻게 표시하나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '각 날짜를 클릭하면 참여(노란색) → 불참(회색) → 미정(흰색) 순서로 변경됩니다. 원하는 상태를 선택하여 참석 가능 여부를 표시할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '가장 많은 사람이 가능한 날짜를 쉽게 확인할 수 있나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '네, 화면 상단에 "참여 가능 인원이 가장 많은 날짜"가 자동으로 표시됩니다. 실시간으로 업데이트되어 최적의 모임 날짜를 쉽게 확인할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '모바일에서도 사용할 수 있나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '네, 모바일 브라우저에서도 최적화되어 작동합니다. 별도의 앱 설치 없이 웹 브라우저에서 바로 사용할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '일정을 잠그면 어떻게 되나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '"일정 확정하기" 버튼을 누르면 모든 참여자의 참석 여부가 잠겨서 더 이상 수정할 수 없게 됩니다. 최종 결정 후 실수로 변경되는 것을 방지할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        'name': '링크를 잃어버리면 어떻게 하나요?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': '안타깝게도 링크를 잃어버리면 해당 일정을 다시 찾을 수 없습니다. 로그인 시스템이 없기 때문에 링크를 카카오톡, 메모장 등에 안전하게 보관해두시는 것을 권장합니다.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
