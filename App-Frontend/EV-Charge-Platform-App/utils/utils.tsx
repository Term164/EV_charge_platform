import Type2SVG from "../assets/connector-icons/ev-plug-type2.svg";
import CHAdeMOSVG from "../assets/connector-icons/ev-plug-chademo.svg";
import TeslaSVG from "../assets/connector-icons/ev-plug-tesla.svg";
import CSSSVG from "../assets/connector-icons/ev-plug-ccs2.svg";
import { ChargingType } from "../utils/types";
import { useCurrentSettings } from "./GlobalStateContext";

export function getConnectorIcon(connectorType: ChargingType) {
    const { colorScheme, toggleColorScheme } = useCurrentSettings();
    switch(connectorType) {
        case ChargingType.TYPE2: 
            return <Type2SVG width={35} height={35} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'} />
        case ChargingType.TYPE1: 
            return <Type2SVG width={30} height={30} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'} />
        case ChargingType.CHAdeMO: 
            return <CHAdeMOSVG width={25} height={25} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'}/>
        case ChargingType.CCS:
            return <CSSSVG width={30} height={30} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'}/>
        case ChargingType.TESLASUC:
            return <TeslaSVG width={25} height={25} fill={colorScheme === 'light' ? '#1e293b' : '#cbd5e1'}/>
    }
}


export function getTimeFromDate(date: Date) {
    return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)} `
}
