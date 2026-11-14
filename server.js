import app from './src/app.js'
import connectDB from './src/database/database.js';

app.listen(3000, () => {
    connectDB()
    console.log('Server is running on port 3000')
});




