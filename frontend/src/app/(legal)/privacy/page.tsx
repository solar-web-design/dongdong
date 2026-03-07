import Link from 'next/link';

export const metadata = {
  title: '개인정보 처리방침 - 동동',
  description: '동동 대학 동문 네트워크 플랫폼 개인정보 처리방침',
};

export default function PrivacyPage() {
  return (
    <article className="text-gray-900">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        돌아가기
      </Link>

      {/* 제목 */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2">개인정보 처리방침</h1>
      <p className="text-sm text-gray-500 mb-10">시행일: 2026년 3월 7일</p>

      <p className="mb-8 leading-relaxed">
        동동 - 대학 동문 네트워크 플랫폼(이하 &quot;서비스&quot;)은 「개인정보 보호법」 제30조에 따라
        정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기
        위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
      </p>

      {/* 1. 개인정보의 처리 목적 */}
      <Section number={1} title="개인정보의 처리 목적">
        <p className="mb-3">서비스는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>회원 가입 및 관리</strong>
            <br />
            회원제 서비스 제공에 따른 본인 확인, 회원자격 유지·관리, 동문 인증, 회장 승인 절차 처리
          </li>
          <li>
            <strong>서비스 제공</strong>
            <br />
            동문 프로필 제공, 모임 관리, 그룹 채팅·DM, 회비·회계 관리, 공지사항 전달
          </li>
          <li>
            <strong>서비스 개선</strong>
            <br />
            서비스 이용 기록 분석을 통한 기능 개선 및 신규 서비스 개발
          </li>
          <li>
            <strong>안전한 이용 환경 구축</strong>
            <br />
            부정 이용 방지, 비인가 사용 탐지, 계정 보안 유지
          </li>
        </ol>
      </Section>

      {/* 2. 수집하는 개인정보 항목 */}
      <Section number={2} title="수집하는 개인정보 항목">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-200 mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">구분</th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">항목</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium whitespace-nowrap">
                  필수 항목
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  이메일 주소, 비밀번호(암호화 저장), 이름, 대학명
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium whitespace-nowrap">
                  선택 항목
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  전화번호, 학과, 입학년도, 졸업년도, 학번, 자기소개, 직장, 직위, 거주지, 프로필 이미지
                </td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2 font-medium whitespace-nowrap">
                  자동 수집
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  서비스 이용 기록, 접속 로그, IP 주소, 기기 정보
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600">
          소셜 로그인(카카오, Google) 이용 시 해당 플랫폼에서 제공하는 식별자, 이메일, 이름이 추가로
          수집될 수 있습니다.
        </p>
      </Section>

      {/* 3. 개인정보의 처리 및 보유기간 */}
      <Section number={3} title="개인정보의 처리 및 보유기간">
        <p className="mb-3">
          서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
          동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>회원 정보:</strong> 회원 탈퇴 시까지. 단, 관계 법령에 따라 보존이 필요한 경우 해당
            기간 동안 보관합니다.
          </li>
          <li>
            <strong>서비스 이용 기록, 접속 로그:</strong> 「통신비밀보호법」에 따라 3개월
          </li>
          <li>
            <strong>계약 또는 청약 철회 기록:</strong> 「전자상거래 등에서의 소비자 보호에 관한 법률」에
            따라 5년
          </li>
          <li>
            <strong>대금 결제 및 재화 공급 기록:</strong> 「전자상거래 등에서의 소비자 보호에 관한
            법률」에 따라 5년
          </li>
        </ul>
      </Section>

      {/* 4. 개인정보의 제3자 제공 */}
      <Section number={4} title="개인정보의 제3자 제공">
        <p>
          서비스는 정보주체의 개인정보를 제1조에서 명시한 처리 목적 범위 내에서만 처리하며,{' '}
          <strong>원칙적으로 제3자에게 개인정보를 제공하지 않습니다.</strong> 다만, 다음의 경우에는
          예외로 합니다.
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>정보주체가 사전에 별도 동의한 경우</li>
          <li>법령에 특별한 규정이 있는 경우</li>
        </ul>
      </Section>

      {/* 5. 개인정보 처리의 위탁 */}
      <Section number={5} title="개인정보 처리의 위탁">
        <p className="mb-3">
          서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-gray-200 mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">
                  수탁업체
                </th>
                <th className="border border-gray-200 px-4 py-2 text-left font-semibold">
                  위탁 업무
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2">주식회사 카카오</td>
                <td className="border border-gray-200 px-4 py-2">카카오 소셜 로그인(OAuth) 인증</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Google LLC</td>
                <td className="border border-gray-200 px-4 py-2">구글 소셜 로그인(OAuth) 인증</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600">
          위탁계약 시 개인정보 보호 관련 법규의 준수, 개인정보에 관한 비밀 유지, 재위탁 제한,
          사고 시의 책임 부담 등을 명확히 규정하고 있습니다.
        </p>
      </Section>

      {/* 6. 정보주체의 권리·의무 및 행사 방법 */}
      <Section number={6} title="정보주체의 권리·의무 및 행사 방법">
        <p className="mb-3">
          정보주체는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>개인정보 열람 요구</li>
          <li>오류 등이 있을 경우 정정 요구</li>
          <li>삭제 요구</li>
          <li>처리 정지 요구</li>
        </ol>
        <p className="mt-3">
          위 권리 행사는 서비스 내 설정 페이지를 통해 직접 처리하거나, 개인정보 보호책임자에게
          서면, 이메일로 연락하시면 지체 없이 조치하겠습니다.
        </p>
        <p className="mt-2">
          정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우, 정정 또는 삭제를
          완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.
        </p>
      </Section>

      {/* 7. 개인정보의 파기 */}
      <Section number={7} title="개인정보의 파기">
        <p className="mb-3">
          서비스는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
          지체 없이 해당 개인정보를 파기합니다.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>전자적 파일:</strong> 복구 및 재생이 불가능한 방법으로 영구 삭제
          </li>
          <li>
            <strong>종이 문서:</strong> 분쇄기로 분쇄하거나 소각하여 파기
          </li>
        </ul>
        <p className="mt-3">
          다만, 다른 법령에 따라 보존하여야 하는 경우에는 해당 개인정보를 별도의 데이터베이스(DB)로
          옮기거나 보관 장소를 달리하여 보존합니다.
        </p>
      </Section>

      {/* 8. 개인정보의 안전성 확보조치 */}
      <Section number={8} title="개인정보의 안전성 확보조치">
        <p className="mb-3">
          서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>비밀번호 암호화:</strong> 비밀번호는 bcrypt 알고리즘을 사용하여 단방향 암호화하여
            저장하며, 원문은 어떠한 경우에도 저장하지 않습니다.
          </li>
          <li>
            <strong>전송 구간 암호화:</strong> 개인정보 및 인증 정보는 SSL/TLS(HTTPS)를 통해 암호화하여
            전송합니다.
          </li>
          <li>
            <strong>접근 권한 관리:</strong> 개인정보에 대한 접근 권한을 최소한의 인원으로 제한하고
            있습니다.
          </li>
          <li>
            <strong>접속 기록 보관:</strong> 개인정보 처리 시스템에 대한 접속 기록을 최소 1년 이상
            보관·관리하고 있습니다.
          </li>
          <li>
            <strong>보안 프로그램 운영:</strong> 해킹이나 악성 프로그램 등에 대비하여 보안 시스템을
            설치·운영하고 있습니다.
          </li>
        </ol>
      </Section>

      {/* 9. 개인정보 보호책임자 */}
      <Section number={9} title="개인정보 보호책임자">
        <p className="mb-3">
          서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
          불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <p>
            <strong>개인정보 보호책임자</strong>
          </p>
          <p>직책: 서비스 운영 책임자</p>
          <p>연락처: privacy@dongdong.app</p>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          정보주체는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만 처리, 피해 구제 등에
          관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다. 서비스는 정보주체의 문의에 대해
          지체 없이 답변 및 처리해 드리겠습니다.
        </p>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하시기 바랍니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)
            </li>
            <li>
              개인정보 분쟁조정위원회 (www.kopico.go.kr / 1833-6972)
            </li>
            <li>
              대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)
            </li>
            <li>
              경찰청 사이버수사국 (ecrm.cyber.go.kr / 국번없이 182)
            </li>
          </ul>
        </div>
      </Section>

      {/* 부칙 */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          본 개인정보 처리방침은 2026년 3월 7일부터 적용됩니다.
        </p>
      </div>
    </article>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg md:text-xl font-bold mb-4 text-gray-900">
        제{number}조 ({title})
      </h2>
      <div className="text-sm md:text-base leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}
