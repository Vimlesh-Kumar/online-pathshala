<template>
    <v-sheet class=" pa-12 mt-15" rounded>
        <v-card class="mx-auto px-6 py-8" max-width="344">
            <v-card-text>Hello{{ username }}</v-card-text>
        </v-card>
    </v-sheet>
</template>

<script>
// import axios from 'axios'

// export default {
//     // async created() {
//     //     const respone=await axios.get()
//     // },
//     mounted() {
//         this.details();
//     },
//     methods: {
//         async details() {
//             await axios.get("user/details")
//         }
//     },
// }

// import jwt from 'jsonwebtoken';

// export default {
//     data() {
//         return {
//             username: '',
//             user:''
//         };
//     },
//     created() {
//         const token = localStorage.getItem('token'); // assuming the token is stored in local storage
//         const secret = 'mysecretkey'; // replace with your own secret key

//         try {
//             const decoded = jwt.verify(token, secret);
//             this.username = decoded.username;
//             this.user=decoded
//         } catch (err) {
//             console.log('Error decoding token:', err);
//         }
//     },
// };

</script>