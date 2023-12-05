import { Building, ChargingType, Reservation, ReservationStatus } from "./types";

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

export const reservations: Reservation[] = [
    {
        building: markers[0],
        allocated_connector: {
            chargingType: ChargingType.TYPE2,
            watts: 22,
            numberOfConnectors: 1
        },
        charging_time: 3,
        desired_from: new Date(),
        desired_to: new Date(),
        desired_type: ChargingType.TYPE2,
        allocated_from: new Date(),
        allocated_to: new Date(new Date().getTime() + 60 * 60 * 1000),
        queueNumber: 0,
        reservation_status: ReservationStatus.RESERVED
    },
    {
        building: markers[1],
        allocated_connector: {
            chargingType: ChargingType.CCS,
            watts: 40,
            numberOfConnectors: 1
        },
        charging_time: 3,
        desired_from: new Date(),
        desired_to: new Date(),
        desired_type: ChargingType.CCS,
        allocated_from: new Date(),
        allocated_to: new Date(),
        queueNumber: 0,
        reservation_status: ReservationStatus.ALLOCATED
    },
    {
        building: markers[2],
        allocated_connector: null,
        charging_time: 3,
        desired_from: new Date(),
        desired_to: new Date(),
        desired_type: ChargingType.CHAdeMO,
        allocated_from: null,
        allocated_to: null,
        queueNumber: 4,
        reservation_status: ReservationStatus.INQUEUE
    }   
]