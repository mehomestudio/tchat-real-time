exports.generateToken = () => {
    const randChars = () => {
        return Math.random().toString(36).substr(2);
    }

    return randChars() + randChars();
}