<template>
    <v-main>
        <v-container>
            <div>
                <h1>Good Evening</h1>
            </div>
        </v-container>
    </v-main>
    <all-courses :allCourses="allCourses"></all-courses>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import AllCourses from '../components/course/AllCourses.vue'

export default {
    components:{
        AllCourses
    },
    data(){
        return{
            // courses:this.allCourses
        }
    },
    computed: {
        ...mapGetters(['allCourses'])
    },
    async created() {
        const response = await axios.get('/courses')
        // console.log(response.data.courses)
        this.$store.dispatch('allCourses', response.data.courses)
        // console.log(this.courses)
    }
}
</script>