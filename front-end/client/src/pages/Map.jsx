import Navbar from "../components/layout/navbar";
import MapView from "../components/map/mapview";

export default function Map() {
  return (
    <>
      <Navbar />
      <div style={{ height: "calc(100vh - 56px)", marginTop: "56px" ,width: "100vw", }}>
        <MapView />
      </div>
    </>
  );
}

