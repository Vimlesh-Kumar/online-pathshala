<template>
    <div class="my-10">
        <v-card class="mt-10 mx-auto px-8 py-5" max-width="500">
            <v-card-title class="mb-3">Course details:-</v-card-title>
            <v-form @submit.prevent="submitForm">
                <v-text-field variant="solo" label="Course Title" v-model="title" required></v-text-field>
                <v-text-field variant="solo" label="Subtitle" v-model="subtitle" required></v-text-field>
                <v-select variant="solo" label="Category" v-model="category" :items="categories" required></v-select>
                <v-text-field variant="solo" label="Price" v-model="price" type="number" required></v-text-field>
                <v-text-field variant="solo" label="Course Thumbnail URL" v-model="url" type="url" required></v-text-field>
                <v-btn block color="success" size="large" type="submit" required>ADD COURSE</v-btn>
            </v-form>
        </v-card>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
    data() {
        return {
            title: "",
            subtitle: "",
            author: "",
            category: "",
            categories: this.$store.state.categories,
            price: "",
            url: ""
        };
    },
    computed: {
        ...mapGetters(['user'])
    },
    methods: {
        async submitForm() {
            const courseDetails = {
                title: this.title,
                subtitle: this.subtitle,
                author: this.user.full_name,
                category: this.category,
                price: this.price,
                thumb_url: this.url
            };
            console.log(courseDetails);
            const response = await axios.post('user/tutor/add-course', courseDetails)
            console.log(response.data.data.insertId)

            // enrolling
            const enrollmentDetails={
                cours_id:response.data.data.insertId,
                user_id:this.user.id
            }

            console.log(enrollmentDetails)

            const enrollResponse=await axios.post('user/course/course-enrollment',enrollmentDetails)
            console.log(enrollResponse)
            
            this.$router.push('/user/home')

        }
    },
};
</script>