export const NAV_BUTTON_SIZE =
  "h-[clamp(10vh,10vw,18vh)] w-[clamp(10vh,10vw,18vh)]";
export const RESULT_BUTTON_SIZE =
  "min-h-[clamp(10vh,10vw,18vh)] min-w-[clamp(18vw,22vw,32vw)]";
export const QUESTION_IMAGE_SIZE =
  "max-h-[clamp(12vh,10vw,18vh)] w-[clamp(12vh,10vw,18vh)]";
export const ANSWER_IMAGE_SIZE =
  "h-[clamp(7vh,6vw,10vh)] w-[clamp(7vh,6vw,10vh)]";
export const ANSWER_BUTTON_SIZE = "min-h-[clamp(14vh,16vh,22vh)]";

export function getAnswerButtonClass(isSelected) {
  return (
    `flex ${ANSWER_BUTTON_SIZE} w-full cursor-pointer flex-col items-center justify-center gap-[clamp(1vh,1.5vh,2vh)] rounded-lg border-2 px-[clamp(1vw,1.5vw,2vw)] py-[clamp(1vh,2vh,3vh)] text-center text-xl font-bold text-[#30306f] shadow-sm ` +
    (isSelected
      ? "border-[#c34834] bg-[#f8e5c0] ring-2 ring-[#c34834]"
      : "border-[#b9ddec] bg-white/85 hover:border-[#0795a1] hover:bg-[#e4f6f4]")
  );
}
