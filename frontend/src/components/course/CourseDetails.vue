<template>
    <v-main>
        <div class="bg-black">
            <v-container>
                <v-row>
                    <v-col cols="8">
                        <div>
                            <v-text style="font-size: 15px;">{{ singleCourse.category }} > {{
                                singleCourse.title }}
                            </v-text>
                        </div>
                        <div class="my-1">
                            <v-text class="font-weight-bold"
                                style="font-size:45px; font-family: 'Times New Roman', Times, serif;">{{
                                    singleCourse.title }}
                            </v-text>
                        </div>
                        <div>
                            <v-text>
                                {{ singleCourse.subtitle }}
                            </v-text>
                        </div>
                        <div class="d-flex">
                            <v-rating :model-value="singleCourse.rating" color="amber" density="compact" half-increments
                                readonly size="small"></v-rating>

                            <div class="text-amber ms-5">
                                {{ singleCourse.rating }}
                            </div>
                        </div>
                        <div>
                            <v-text style="font-size: 14px;">Created by {{ singleCourse.author }}</v-text>
                        </div>
                    </v-col>
                    <v-col cols="4">
                        <div class="">
                            vim
                            <v-card height="400">
                               
                            </v-card>
                        </div>
                    </v-col>
                </v-row>


            </v-container>
        </div>
        <div class="bg-amber">
            <v-container class="bg-red">
                vim
            </v-container>
        </div>
        <v-container>Vimlesh</v-container>
    </v-main>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters(['singleCourse'])
    }
}
</script>
