import { Header } from "../../components/layout/Header";
import { MapView } from "../../components/zr/MapContainer";
export const HomePage = () => {


    return(

       
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
             <Header />
            <h1 className="text-4xl text-black font-bold mb-4">Benvingut a ReciclamJa</h1>
            <p className="text-lg text-gray-700 mb-8">Es una app </p>

        <MapView className="w-full h-full" />
        </div>

    )
}
