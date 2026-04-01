import DisplayHeader from "@/components/display/DisplayHeader";
import MainContent from "@/components/display/MainContent";
import DisplaySidebar from "@/components/display/DisplaySidebar";
import DisplayFooter from "@/components/display/DisplayFooter";

const DisplayPage = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-primary">
      <DisplayHeader />
      <div className="flex-1 flex min-h-0">
        <MainContent />
        <DisplaySidebar />
      </div>
      <DisplayFooter />
    </div>
  );
};

export default DisplayPage;