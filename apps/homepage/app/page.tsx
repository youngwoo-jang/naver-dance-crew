import { BottomNav } from "@/components/ui/BottomNav";
import { redirect } from "next/navigation";

export default function HomePage() {

  redirect("/board");

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      {/* <header className="flex items-center px-6 py-6 justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-tighter uppercase">
            네이버 댄스 크루
          </h1>
        </div>
      </header> */}

      {/* Hero Section */}
      {/* <div className="px-6 mb-12">
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm group">
          <img
            alt="댄스 공연"
            className="w-full h-full object-cover grayscale brightness-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTckqJ2WJXzt_qXDUPpzxHVtJ65gQzX2Qy7aZtzbgIWFEhyPL10RYw1JF7w6uUGypJMyLX2-KzYfBDm_1EKw6xz-U6KOVdi0O79n15CzCZaYvw0ag6l9txqgH7OIDvLtYCJcyw1Y3x7H7uX-alpaVLxkPU2Ysfxs3rV460PgZiqSmbr-sGFn1da_Pv0xcJdOD4ZUYkatmcDkutXx_BzXseOvzUaEkD_v9alYP2i7RD7yh1mpU6LbG-YKsqbdKq-MRH36P3vafhZeE"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-white text-4xl font-light leading-tight mb-6">
              움직임을
              <br />
              <span className="font-bold">재정의하다.</span>
            </h2>
            <button className="w-full bg-white text-black py-4 text-sm font-semibold uppercase tracking-widest rounded-sm transition-opacity hover:opacity-90 active:scale-[0.98]">
              함께하기
            </button>
          </div>
        </div>
      </div> */}

      {/* Our Space Section */}
      {/* <div className="px-6 mb-12">
        <div className="border-b border-black pb-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            우리의 공간
          </h3>
        </div>
        <div className="space-y-6">
          <img
            alt="스튜디오 내부"
            className="w-full h-48 object-cover grayscale rounded-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfxnUUznXbeV2RhmkuIPMIv2fhR5I8DcvC8OX5187P6woLMyIu3DBURgpNHHwARbAbgeSiS4rCMPXTPojQVLx9mR7iVl3GDFnlY-0mDAUoc9yd1KfNTfr9w_3bT1KG1QheO2TAKUwT0aNxmWynokSx9zbeNdrl-_LPR5CbuNJaDXqOVlghbR0r5FqYbWZmubHPo1JwwD8mluSDcnitZMql4XTp-6pTMhqBN5Qv_jdFi7SfGULKZXJIysHZNP3fTnzNp0d-hn3v_kU"
          />
          <div className="space-y-4">
            <h4 className="text-2xl font-semibold tracking-tight">
              모던 콜렉티브
            </h4>
            <p className="text-gray-500 leading-relaxed font-light text-[15px]">
              기술적 성장과 창작의 자유를 위한 공간. 우리 스튜디오는
              오직 퍼포먼스에만 집중할 수 있는 미니멀한 환경을
              제공합니다.
            </p>
            <button className="inline-flex items-center border-b border-black py-1 text-sm font-medium">
              스튜디오 상세보기
              <span className="material-symbols-outlined text-sm ml-1">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div> */}

      {/* Community Board Preview */}
      {/* <div className="px-6 mb-8">
        <div className="flex items-end justify-between border-b border-black pb-4 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            커뮤니티 게시판
          </h3>
          <a
            className="text-[10px] font-bold uppercase tracking-widest border-b border-gray-300"
            href="/board"
          >
            전체보기
          </a>
        </div>
        <div className="divide-y divide-gray-100">
          <article className="py-6 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                익명 &bull; 2분 전
              </span>
              <span className="material-symbols-outlined text-gray-300 text-lg">
                more_horiz
              </span>
            </div>
            <h5 className="text-lg font-medium mb-2 leading-snug">
              오늘 밤 개인 연습 가능한가요?
            </h5>
            <p className="text-gray-500 text-sm font-light mb-4 line-clamp-2">
              9시 이후에 컨템포러리 라인 연습할 조용한 장소를 찾고 있어요.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span className="material-symbols-outlined text-sm">
                  chat_bubble
                </span>{" "}
                12
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span className="material-symbols-outlined text-sm">
                  favorite
                </span>{" "}
                45
              </div>
            </div>
          </article>
          <article className="py-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
                익명 &bull; 15분 전
              </span>
              <span className="material-symbols-outlined text-gray-300 text-lg">
                more_horiz
              </span>
            </div>
            <h5 className="text-lg font-medium mb-2 leading-snug">
              안무 피드백 세션
            </h5>
            <p className="text-gray-500 text-sm font-light mb-4 line-clamp-2">
              새 영상 올렸어요. 플로어 워크 부분에 대한 솔직한 피드백
              부탁드립니다.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span className="material-symbols-outlined text-sm">
                  chat_bubble
                </span>{" "}
                8
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                <span className="material-symbols-outlined text-sm">
                  favorite
                </span>{" "}
                22
              </div>
            </div>
          </article>
        </div>
      </div> */}

      준비중

      <BottomNav />
    </div>
  );
}
