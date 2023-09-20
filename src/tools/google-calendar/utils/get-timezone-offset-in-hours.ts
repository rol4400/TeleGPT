const getTimezoneOffsetInHours = () => {
    const offsetInMinutes = new Date().getTimezoneOffset()
    const offsetInHours = -offsetInMinutes / 60

    // Just hardcode it as +10 for now
    return 10
  }
  
  export { getTimezoneOffsetInHours }