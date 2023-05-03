<template>
    <v-main>
        <v-container>
            vvvvv
            <div>
                <v-file-input ref="fileInput" label="Select a file" v-model="file"
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"></v-file-input>
                <v-btn @click="uploadFile">Upload</v-btn>
            </div>
        </v-container>
    </v-main>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters(['user'])
    },
    async created() {
        await this.$store.dispatch('fetchingUser')
    },
    methods: {
        async uploadFile() {
            // console.log(this.$refs.fileInput.files[0])
            const file = this.$refs.fileInput.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (event) => {
                const fileContent = event.target.result;
                console.log(fileContent)
                const response = await axios.post('/lessons/upload', {
                    name: file.name,
                    content: fileContent
                });
                const data = await response.json();
                console.log(data);
            }
        }
    }
}
</script>