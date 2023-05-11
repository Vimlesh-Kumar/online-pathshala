<template>
    <div>
        <div class="mt-5 text-center">
            <p class="font-weight-bold" style="font-size:45px; font-family: 'Times New Roman', Times, serif;">Added
                Curriculum
            </p>
        </div>
        <v-container v-for="section in lectureBySection" :key="section">
            <v-card width="1100" class="mx-auto pb-10 bg-">
                <v-card-title class="bg-black mb-5">Section: {{ section[0].section_name }}</v-card-title>
                <v-container v-for="(lecture, index) in section" :key="index">
                    <v-sheet class="border true mx-15 pa-5 pb-0">
                        <h3>Lecture : {{ index + 1 }}</h3>
                        <v-divider class="my-1"></v-divider>
                        <v-row>
                            <v-col md="6" xs="12">
                                <v-card-text>Lecture Name: {{ lecture.lesson_name }}</v-card-text>
                                <v-card-text>Lecture Duration: {{ lecture.duration }}</v-card-text>

                            </v-col>
                            <v-col md="6" xs="12">
                                <!-- <h1>v</h1> -->
                                <v-responsive aspect-ratio="16/9">
                                    <video controls>
                                        <source>
                                    </video>
                                </v-responsive>
                            </v-col>
                        </v-row>
                    </v-sheet>
                </v-container>
            </v-card>
        </v-container>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            courseSections: [],
            lectureBySection: ''
        }
    },

    async created() {
        const currentUrl = this.$route.path;
        const url = currentUrl.split("/");
        const courseId = url[2]

        const response = await axios.get('/course/section/all-sections', {
            params: {
                course_id: courseId
            }
        })
        const data = response.data.allsectionLecturesDetails

        // lectureAccordingTOSection
        const sections = {}
        for (let object of data) {
            const section_name = object.section_name
            if (sections[section_name]) {
                sections[section_name].push(object)
            }
            else {
                sections[section_name] = []
                sections[section_name].push(object)
            }
        }

        console.log(sections)

        this.courseSections = data
        this.lectureBySection = sections
    },
}
</script>