enum Status {
    Reserved,
    Charging,
    Finished
}

interface Reservation {
    reservationID: number,
    status?: Status,
    idTag?: string,
    expiryDate?: string
    nextReservation?: Reservation
}

interface ReservationData {
    stationID: string,
    connectorID: number,
    idTag: string,
    expiryDate: Date
}

export { Reservation, ReservationData, Status };