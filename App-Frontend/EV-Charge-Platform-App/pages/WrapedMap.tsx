import { useColorScheme } from "nativewind";
import Map from "./Map";

export default function WrapedMap() {
    const { colorScheme, toggleColorScheme } = useColorScheme();

    return(
        <Map cs={colorScheme} />
    )
    
}