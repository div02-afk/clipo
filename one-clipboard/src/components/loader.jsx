import { Grid } from "react-loader-spinner";
export default function Loader() {
  return (
    <div className="flex items-center flex-col text-center select-none justify-center align-middle bg-[#101010] p-10 h-full min-h-screen text-[rgba(255,255,255,0.5)] overflow-x-hidden">
      <Grid
        type="ThreeDots"
        color="rgba(255,255,255,0.4)"
        height={40}
        width={40}
      />
    </div>
  );
}
