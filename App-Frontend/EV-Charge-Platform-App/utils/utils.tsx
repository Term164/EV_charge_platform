import Type2SVG from "../assets/connector-icons/ev-plug-type2.svg";
import CHAdeMOSVG from "../assets/connector-icons/ev-plug-chademo.svg";
import TeslaSVG from "../assets/connector-icons/ev-plug-tesla.svg";
import CSSSVG from "../assets/connector-icons/ev-plug-ccs2.svg";
import { ChargingType } from "../utils/types";

export function getConnectorIcon(connectorType: ChargingType) {
    switch(connectorType) {
        case ChargingType.TYPE2: 
            return <Type2SVG width={30} height={30} fill={'#1e293b'} />
        case ChargingType.TYPE1: 
            return <Type2SVG width={30} height={30} fill={'#1e293b'} />
        case ChargingType.CHAdeMO: 
            return <CHAdeMOSVG width={25} height={25} fill={'#1e293b'}/>
        case ChargingType.CCS:
            return <CSSSVG width={30} height={30} fill={'#1e293b'}/>
        case ChargingType.TESLASUC:
            return <TeslaSVG width={25} height={25} fill={'#1e293b'}/>
    }
}


export function getTimeFromDate(date: Date) {
    return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)} `
}
