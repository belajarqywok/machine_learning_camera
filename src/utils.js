const generateRandomString = async (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let randomString = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      randomString += chars.charAt(randomIndex)
    }

    return randomString
}

export const generateBlobImageName = async () => {
    const timestamp = new Date().getTime()
    const randomString = await generateRandomString(64)
    const fileName = `${timestamp}-${randomString}.jpg`

    return fileName
}