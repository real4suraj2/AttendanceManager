const currentDate = (minus = 0) => {

    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - minus);
    //dd-mm-yyyy
    // return `${date.getDate() - minus}-${date.getMonth() + 1}-${date.getFullYear()}`;
    return date;
}

const showDate = date => `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

export {currentDate, showDate};