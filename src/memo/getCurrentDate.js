function getCurrentDate() {
    const currentDate = new Date(Date.now())

    // This will ensure that there's no rounding issue when calculating the
    // offset to the server time
    currentDate.setMilliseconds(0)

    return currentDate
}


export default getCurrentDate;