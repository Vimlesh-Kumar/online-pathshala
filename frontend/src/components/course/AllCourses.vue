<template>
    <!-- <v-main> -->
    <v-container>
        <v-sheet class="px-7 py-5 border true ">

            <v-row>
                <v-col v-for="course in allCourses" :key="course" cols="3">
                    <!-- <v-card height="500"> -->
                    <v-card :loading="loading" class="mx-auto my-2"  @click="handleOnCourseClick(course)">
                        <!-- {{ course.thumb_url }} -->
                        <template v-slot:loader="{ isActive }">
                            <v-progress-linear :active="isActive" color="deep-purple" height="4"
                                indeterminate></v-progress-linear>
                        </template>

                        <v-img cover height="150" :src="course.thumb_url" alt="My Image"></v-img>

                        <v-card-item>
                            <v-card-title>{{ course.title }}</v-card-title>

                            <v-card-subtitle>
                                <span class="me-1">{{ course.author }}</span>
                            </v-card-subtitle>
                        </v-card-item>

                        <v-card-text>
                            <v-row align-content="center" class="mx-0">
                                <v-rating :model-value="course.rating" color="amber" density="compact" half-increments
                                    readonly size="small"></v-rating>

                                <div class="text-grey ms-5">
                                    {{ course.rating }}
                                </div>
                            </v-row>
                            <div class="mt-5">
                                <h3>₹ {{ course.price }}</h3>
                            </div>
                        </v-card-text>
                    </v-card>
                    <!-- </v-card> -->
                </v-col>
            </v-row>
        </v-sheet>
    </v-container>
    <!-- </v-main> -->
</template>

<script>
export default {
    data: () => ({
        loading: false,
        selection: 1,
    }),
    props: ['allCourses'],

    methods: {
        reserve() {
            this.loading = true

            setTimeout(() => (this.loading = false), 2000)
        },

        handleOnCourseClick(course) {
            this.$store.dispatch('getACourse', course)
            console.log(course)
            this.$router.push(`/course/${course.id}`)
        }
    }
}
</script>