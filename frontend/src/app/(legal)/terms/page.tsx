import Link from 'next/link';

export const metadata = {
  title: '이용약관 - 동동',
  description: '동동 대학 동문 네트워크 플랫폼 이용약관',
};

export default function TermsPage() {
  return (
    <article className="text-gray-900">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        돌아가기
      </Link>

      {/* 제목 */}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">이용약관</h1>
      <p className="mt-2 text-sm text-gray-500">시행일: 2026년 3월 7일</p>

      <hr className="my-8 border-gray-200" />

      {/* 제1조 목적 */}
      <Section num={1} title="목적">
        <p>
          본 약관은 &ldquo;동동 - 대학 동문 네트워크 플랫폼&rdquo;(이하
          &ldquo;서비스&rdquo;)의 이용과 관련하여 서비스를 제공하는
          운영자(이하 &ldquo;운영자&rdquo;)와 이를 이용하는 회원(이하
          &ldquo;회원&rdquo;) 간의 권리, 의무 및 책임사항, 기타 필요한
          사항을 규정함을 목적으로 합니다.
        </p>
      </Section>

      {/* 제2조 정의 */}
      <Section num={2} title="정의">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            &ldquo;서비스&rdquo;란 운영자가 제공하는 대학 동문 간 네트워킹,
            모임 관리, 채팅, 회비 회계 등 관련 제반 서비스를 말합니다.
          </li>
          <li>
            &ldquo;회원&rdquo;이란 본 약관에 동의하고 가입 신청 후 승인을
            받아 서비스를 이용하는 자를 말합니다.
          </li>
          <li>
            &ldquo;동문회&rdquo;란 서비스 내에서 생성된 대학 동문
            커뮤니티 단위를 말합니다.
          </li>
          <li>
            &ldquo;회장&rdquo;이란 동문회를 대표하며 회원 가입 승인 및
            관리 권한을 가진 자를 말합니다.
          </li>
          <li>
            &ldquo;게시물&rdquo;이란 회원이 서비스 내에 게시한 텍스트,
            이미지, 파일 등 일체의 콘텐츠를 말합니다.
          </li>
          <li>
            &ldquo;관리자&rdquo;란 회장, 부회장, 총무 등 동문회 운영
            권한을 부여받은 회원을 말합니다.
          </li>
        </ol>
      </Section>

      {/* 제3조 약관의 효력 및 변경 */}
      <Section num={3} title="약관의 효력 및 변경">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게
            공지함으로써 효력이 발생합니다.
          </li>
          <li>
            운영자는 &ldquo;약관의 규제에 관한 법률&rdquo;,
            &ldquo;정보통신망 이용촉진 및 정보보호 등에 관한 법률&rdquo;
            등 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수
            있습니다.
          </li>
          <li>
            약관을 변경할 경우, 적용일 및 변경 사유를 명시하여 현행
            약관과 함께 적용일 7일 전(회원에게 불리한 변경의 경우 30일
            전)부터 서비스 내 공지합니다.
          </li>
          <li>
            회원이 변경된 약관에 동의하지 않는 경우, 서비스 이용을
            중단하고 탈퇴할 수 있습니다. 변경된 약관의 효력 발생일
            이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한
            것으로 간주합니다.
          </li>
        </ol>
      </Section>

      {/* 제4조 서비스 이용 */}
      <Section num={4} title="서비스 이용">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            서비스는 연중무휴 1일 24시간 제공을 원칙으로 합니다. 다만,
            시스템 점검 등 운영상 필요한 경우 일시적으로 서비스 제공이
            중단될 수 있습니다.
          </li>
          <li>
            서비스 이용은 운영자의 업무상 또는 기술상 특별한 사유가 없는
            한, 가입 승인 즉시 가능합니다.
          </li>
          <li>
            운영자가 제공하는 서비스의 범위에는 동문 프로필, 피드/게시판,
            모임 관리, 그룹 채팅/DM, 회비 및 회계 관리, 공지사항 등이
            포함됩니다.
          </li>
        </ol>
      </Section>

      {/* 제5조 회원 가입 및 승인 절차 */}
      <Section num={5} title="회원 가입 및 승인 절차">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            서비스 이용을 희망하는 자는 운영자가 정한 가입 양식에 따라
            회원 정보를 기입하고 본 약관에 동의하여 가입 신청을 합니다.
          </li>
          <li>
            가입 신청 후, 해당 동문회의 회장(또는 회장이 위임한
            관리자)의 승인을 받아야 정식 회원으로서 서비스를 이용할 수
            있습니다.
          </li>
          <li>
            회장은 다음 각 호에 해당하는 경우 가입 승인을 거절하거나
            보류할 수 있습니다:
            <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
              <li>실명이 아니거나 타인의 정보를 도용한 경우</li>
              <li>해당 대학 동문임을 확인할 수 없는 경우</li>
              <li>
                가입 신청 시 필수 항목을 허위로 기재하거나 누락한 경우
              </li>
              <li>
                이전에 본 약관 위반으로 회원 자격이 상실된 적이 있는 경우
              </li>
              <li>기타 회원으로 등록하는 것이 부적절하다고 판단되는 경우</li>
            </ul>
          </li>
          <li>
            회원 가입 시점은 회장의 승인 의사가 회원에게 도달한 시점으로
            합니다.
          </li>
        </ol>
      </Section>

      {/* 제6조 회원의 의무 */}
      <Section num={6} title="회원의 의무">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            회원은 관련 법령, 본 약관, 이용안내 및 서비스 내 공지사항을
            준수하여야 하며, 기타 운영자 업무에 방해되는 행위를 하여서는
            안 됩니다.
          </li>
          <li>
            회원은 다음 각 호의 행위를 하여서는 안 됩니다:
            <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
              <li>
                가입 신청 또는 정보 변경 시 허위 내용을 등록하는 행위
              </li>
              <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
              <li>
                서비스 내 게시된 정보를 변경하거나 운영자가 게시하지 않은
                정보를 송신 또는 게시하는 행위
              </li>
              <li>
                운영자 및 제3자의 지식재산권을 침해하는 행위
              </li>
              <li>
                운영자 및 제3자의 명예를 손상시키거나 업무를 방해하는 행위
              </li>
              <li>
                외설적이거나 폭력적인 내용, 기타 공서양속에 반하는 정보를
                서비스에 공개 또는 게시하는 행위
              </li>
              <li>
                서비스를 이용하여 영리 목적의 광고, 홍보, 판매 행위를
                하는 행위(운영자의 사전 동의 없이)
              </li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ul>
          </li>
          <li>
            회원은 자신의 계정 정보(아이디, 비밀번호 등)를 안전하게
            관리할 의무가 있으며, 이를 제3자에게 양도하거나 대여할 수
            없습니다.
          </li>
        </ol>
      </Section>

      {/* 제7조 서비스 제공의 제한 및 중단 */}
      <Section num={7} title="서비스 제공의 제한 및 중단">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            운영자는 다음 각 호에 해당하는 경우 서비스 제공을 제한하거나
            중단할 수 있습니다:
            <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
              <li>서비스용 설비의 보수 등 공사로 인한 부득이한 경우</li>
              <li>
                전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를
                중지한 경우
              </li>
              <li>천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
              <li>
                기타 서비스를 제공할 수 없는 사유가 발생한 경우
              </li>
            </ul>
          </li>
          <li>
            운영자는 서비스의 제한 또는 중단 시 사전에 회원에게 공지합니다.
            다만, 불가피한 사유로 사전 공지가 불가능한 경우 사후에 공지할
            수 있습니다.
          </li>
          <li>
            운영자는 본 조에 의한 서비스 제한 또는 중단으로 발생하는
            문제에 대해서는 책임을 지지 않습니다. 다만, 운영자의 고의
            또는 중대한 과실에 의한 경우에는 그러하지 아니합니다.
          </li>
        </ol>
      </Section>

      {/* 제8조 게시물 관련 */}
      <Section num={8} title="게시물 관련 (저작권 및 삭제)">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의
            저작자에게 귀속됩니다.
          </li>
          <li>
            회원은 자신이 게시한 게시물이 서비스 내에서 다른 회원에게
            노출되는 것에 동의합니다. 운영자는 서비스 운영, 홍보 등의
            목적으로 회원의 게시물을 서비스 내에서 사용할 수 있습니다.
          </li>
          <li>
            운영자는 다음 각 호에 해당하는 게시물을 사전 통지 없이 삭제
            또는 비공개 처리할 수 있습니다:
            <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
              <li>
                다른 회원 또는 제3자를 비방하거나 명예를 훼손하는 내용
              </li>
              <li>공공질서 및 미풍양속에 위반되는 내용</li>
              <li>범죄적 행위에 결부된다고 인정되는 내용</li>
              <li>
                운영자 또는 제3자의 저작권 등 지식재산권을 침해하는 내용
              </li>
              <li>
                &ldquo;정보통신망 이용촉진 및 정보보호 등에 관한
                법률&rdquo; 및 기타 관련 법령에 위반되는 내용
              </li>
              <li>
                스팸성 광고, 불법 홍보 등 서비스 목적에 부합하지 않는 내용
              </li>
            </ul>
          </li>
          <li>
            회원은 자신의 게시물이 타인의 권리를 침해한 경우 이에 대한
            법적 책임을 부담합니다.
          </li>
        </ol>
      </Section>

      {/* 제9조 채팅 및 DM 관련 */}
      <Section num={9} title="채팅 및 DM 관련">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            서비스는 동문 간 소통을 위해 그룹 채팅 및 1:1 다이렉트
            메시지(DM) 기능을 제공합니다.
          </li>
          <li>
            채팅 및 DM을 통해 전송되는 메시지는 서비스 서버에 저장되며,
            운영자는 관련 법령에 따라 일정 기간 보관할 수 있습니다.
          </li>
          <li>
            회원은 채팅 및 DM을 통해 욕설, 비방, 성희롱, 불법 정보 유포
            등 제6조에서 금지하는 행위를 하여서는 안 됩니다.
          </li>
          <li>
            운영자는 법령에 의한 수사기관의 요청이 있는 경우, 관련
            법률이 정하는 절차에 따라 채팅/DM 내용을 제공할 수 있습니다.
          </li>
          <li>
            운영자는 채팅/DM 내용을 임의로 열람하지 않으며,
            &ldquo;통신비밀보호법&rdquo; 등 관련 법령을 준수합니다.
          </li>
        </ol>
      </Section>

      {/* 제10조 회비 및 회계 관련 */}
      <Section num={10} title="회비 및 회계 관련">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            서비스는 동문회의 회비 징수 및 회계 관리 기능을 제공합니다.
            회비의 금액, 납부 시기 등은 각 동문회의 규정에 따릅니다.
          </li>
          <li>
            회비 관련 기록(입금, 출금, 잔액 등)은 서비스 내에서 투명하게
            조회할 수 있으며, 총무 이상 관리자 권한을 가진 회원이
            관리합니다.
          </li>
          <li>
            운영자는 회비 관련 기록의 정확성을 보증하지 않으며, 회비의
            관리와 사용에 대한 책임은 해당 동문회에 있습니다.
          </li>
          <li>
            회비 납부와 관련한 금전적 분쟁은 해당 동문회 내에서
            해결하여야 하며, 운영자는 이에 관여하지 않습니다.
          </li>
          <li>
            운영자는 회비 결제 관련 제3자 결제 서비스를 연동할 수 있으며,
            해당 결제 서비스의 이용약관이 추가로 적용될 수 있습니다.
          </li>
        </ol>
      </Section>

      {/* 제11조 개인정보 보호 */}
      <Section num={11} title="개인정보 보호">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            운영자는 &ldquo;개인정보 보호법&rdquo;,
            &ldquo;정보통신망 이용촉진 및 정보보호 등에 관한 법률&rdquo;
            등 관련 법령에 따라 회원의 개인정보를 보호합니다.
          </li>
          <li>
            개인정보의 수집, 이용, 제공, 위탁, 보유 기간 등에 관한
            구체적인 사항은 별도의{' '}
            <Link
              href="/privacy"
              className="font-medium text-black underline underline-offset-2 hover:text-gray-600"
            >
              개인정보처리방침
            </Link>
            에 따릅니다.
          </li>
          <li>
            운영자는 회원의 개인정보를 본인의 동의 없이 제3자에게
            제공하지 않습니다. 다만, 법령에 의해 요구되는 경우에는
            그러하지 아니합니다.
          </li>
          <li>
            회원은 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를
            요청할 수 있으며, 운영자는 지체 없이 이에 응합니다.
          </li>
        </ol>
      </Section>

      {/* 제12조 손해배상 및 면책 */}
      <Section num={12} title="손해배상 및 면책">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            운영자는 무료로 제공되는 서비스와 관련하여 회원에게 발생한
            손해에 대해 책임을 지지 않습니다. 다만, 운영자의 고의 또는
            중대한 과실로 인한 손해는 제외합니다.
          </li>
          <li>
            운영자는 회원 간 또는 회원과 제3자 간에 서비스를 매개로
            발생한 분쟁에 대해 개입할 의무가 없으며, 이로 인한 손해를
            배상할 책임이 없습니다.
          </li>
          <li>
            운영자는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등
            불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스
            제공에 관하여 책임을 지지 않습니다.
          </li>
          <li>
            회원이 자신의 개인정보(아이디, 비밀번호 등)를 타인에게 유출
            또는 제공하여 발생하는 피해에 대해서 운영자는 책임을 지지
            않습니다.
          </li>
          <li>
            회원이 게시한 게시물, 채팅 내용 등으로 인해 발생하는 법적
            분쟁 및 손해에 대한 책임은 해당 게시물을 작성한 회원에게
            있습니다.
          </li>
        </ol>
      </Section>

      {/* 제13조 분쟁 해결 */}
      <Section num={13} title="분쟁 해결">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            운영자와 회원 간에 발생한 분쟁에 관한 소송은 대한민국 법을
            준거법으로 합니다.
          </li>
          <li>
            서비스 이용과 관련하여 발생한 분쟁에 대해서는 민사소송법상의
            관할 법원에 소를 제기할 수 있습니다.
          </li>
          <li>
            운영자와 회원 간에 발생한 전자상거래 관련 분쟁에 대해서는
            한국인터넷진흥원(KISA) 내 개인정보침해신고센터,
            한국소비자원의 전자상거래 분쟁조정위원회 등에 분쟁 조정을
            신청할 수 있습니다.
          </li>
        </ol>
      </Section>

      {/* 부칙 */}
      <div className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold">부칙</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          본 약관은 2026년 3월 7일부터 시행합니다.
        </p>
      </div>

      {/* 하단 */}
      <footer className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
        동동 - 대학 동문 네트워크 플랫폼
      </footer>
    </article>
  );
}

/* ──────────────────────────────────────── */
/* Section 컴포넌트                          */
/* ──────────────────────────────────────── */

function Section({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold">
        제{num}조 ({title})
      </h2>
      <div className="mt-3 text-sm leading-relaxed text-gray-800">
        {children}
      </div>
    </section>
  );
}
