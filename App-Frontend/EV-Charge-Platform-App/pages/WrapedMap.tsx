import { useColorScheme } from "nativewind";
import Map from "./Map";
import { useUserData } from "../utils/GlobalStateContext";

export default function WrapedMap() {
    const { colorScheme, toggleColorScheme } = useColorScheme();
    const {buildings} = useUserData();

    return(
        <Map cs={colorScheme} buildings={buildings} />
    )
    
}