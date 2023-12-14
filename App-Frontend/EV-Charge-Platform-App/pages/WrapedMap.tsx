import { useCurrentSettings } from "../utils/GlobalStateContext";
import Map from "./Map";

export default function WrapedMap() {
    const { colorScheme, toggleColorScheme } = useCurrentSettings();

    return(
        <Map cs={colorScheme} />
    )
    
}