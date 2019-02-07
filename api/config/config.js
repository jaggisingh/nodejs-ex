const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "J@gg!123@09081995Rekh@14041995",
    baseUrl: 'https://food-recipe-api.herokuapp.com/'
}

module.exports = config;