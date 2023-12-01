import { Building, ChargingType } from "./types";

export const markers: Building[] = [
    {
        coordinate: {
            latitude: 46.0483697,
            longitude: 14.458256,
        },
        name: 'TEHNOLOŠKI PARK - STAVBA G',
        address: 'Večna pot 150',
        availability: 100,
        stations: 3,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 2
            },
            {
                chargingType: ChargingType.CHAdeMO,
                watts: 50,
                numberOfConnectors: 3
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.067616,
            longitude: 14.5381911,
        },
        name: 'A1 poslovna stavba',
        address: 'Ameriška ulica 4',
        availability: 50,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 4
            },
            {
                chargingType: ChargingType.TESLASUC,
                watts: 120,
                numberOfConnectors: 2
            },
            {
                chargingType: ChargingType.CCS,
                watts: 43,
                numberOfConnectors: 1
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.5398642,
            longitude: 15.6541704,
        },
        name: 'A1 Maribor',
        address: 'Mariborska cesta',
        availability: 10,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 2
            },
            {
                chargingType: ChargingType.TYPE1,
                watts: 7,
                numberOfConnectors: 1
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.0740168,
            longitude: 14.516449,
        },
        name: 'Univerza v Ljubljani Ekonomska fakulteta',
        address: 'Kardeljeva ploščad 17',
        availability: 0,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 4
            },
            {
                chargingType: ChargingType.TESLASUC,
                watts: 120,
                numberOfConnectors: 2
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.067616,
            longitude: 14.5381911,
        },
        name: 'A1 poslovna stavba',
        address: 'Ameriška ulica 4',
        availability: 50,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 4
            },
            {
                chargingType: ChargingType.TESLASUC,
                watts: 120,
                numberOfConnectors: 2
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.067616,
            longitude: 14.5381911,
        },
        name: 'A1 poslovna stavba',
        address: 'Ameriška ulica 4',
        availability: 50,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 4
            },
            {
                chargingType: ChargingType.TESLASUC,
                watts: 120,
                numberOfConnectors: 2
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.067616,
            longitude: 14.5381911,
        },
        name: 'A1 poslovna stavba',
        address: 'Ameriška ulica 4',
        availability: 50,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 4
            },
            {
                chargingType: ChargingType.TESLASUC,
                watts: 120,
                numberOfConnectors: 2
            }
        ]
    },
    {
        coordinate: {
            latitude: 46.067616,
            longitude: 14.5381911,
        },
        name: 'A1 poslovna stavba',
        address: 'Ameriška ulica 4',
        availability: 50,
        stations: 4,
        Connectors: [
            {
                chargingType: ChargingType.TYPE2,
                watts: 22,
                numberOfConnectors: 4
            },
            {
                chargingType: ChargingType.TESLASUC,
                watts: 120,
                numberOfConnectors: 2
            }
        ]
    },
]