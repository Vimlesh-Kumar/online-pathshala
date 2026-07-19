<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-10">
      <div class="eyebrow mb-4">Account Settings</div>
      <h1 class="app-section-title mb-3">Manage Your Profile</h1>
      <p class="app-section-copy mb-0">
        Update your personal information, links, avatar, and security credentials.
      </p>
    </section>

    <v-row>
      <!-- Navigation Tabs / Left Sidebar on Large Screens -->
      <v-col cols="12" md="3">
        <v-card class="glass-panel section-card pa-4 mb-6" flat>
          <v-tabs
            v-model="activeTab"
            direction="vertical"
            color="primary"
            class="profile-tabs"
          >
            <v-tab value="profile" class="justify-start py-3">
              <v-icon start class="mr-2">mdi-account-circle-outline</v-icon>
              Edit Profile
            </v-tab>
            <v-tab value="socials" class="justify-start py-3">
              <v-icon start class="mr-2">mdi-link-variant</v-icon>
              Social Profiles
            </v-tab>
            <v-tab value="security" class="justify-start py-3">
              <v-icon start class="mr-2">mdi-shield-lock-outline</v-icon>
              Password & Security
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>

      <!-- Content Area -->
      <v-col cols="12" md="9">
        <v-window v-model="activeTab">
          <!-- Profile General Form -->
          <v-window-item value="profile">
            <v-card class="glass-panel section-card pa-6 pa-md-8" flat>
              <h2 class="text-h5 font-weight-bold mb-6 text-strong">Personal Information</h2>
              
              <!-- Avatar Section -->
              <div class="mb-8">
                <div class="text-subtitle-1 font-weight-medium mb-4">Choose Your Avatar</div>
                
                <div class="d-flex flex-column flex-sm-row align-center ga-6">
                  <!-- Current Avatar Preview -->
                  <div class="avatar-preview-container">
                    <v-avatar size="100" class="profile-preview-avatar">
                      <v-img v-if="profileForm.avatar_url" :src="profileForm.avatar_url" cover />
                      <span v-else class="text-h4 font-weight-bold">{{ userInitials }}</span>
                    </v-avatar>
                  </div>
                  
                  <div class="flex-grow-1 w-100">
                    <p class="text-caption text-medium-emphasis mb-3">
                      Choose from our premium colorful illustrations or upload a custom photo.
                    </p>
                    
                    <!-- Pre-selected Premium Avatars Grid -->
                    <div class="avatar-grid mb-4">
                      <v-avatar 
                        v-for="(avatar, i) in premiumAvatars" 
                        :key="i"
                        size="46" 
                        class="cursor-pointer hover-lift avatar-option"
                        :class="{ 'avatar-selected': profileForm.avatar_url === avatar }"
                        @click="selectPremiumAvatar(avatar)"
                      >
                        <v-img :src="avatar" cover />
                      </v-avatar>
                    </div>

                    <div class="d-flex align-center">
                      <v-file-input
                        label="Upload Custom Photo"
                        variant="outlined"
                        density="compact"
                        accept="image/*"
                        prepend-icon=""
                        prepend-inner-icon="mdi-camera-outline"
                        hide-details
                        class="custom-avatar-file-input"
                        @change="handleAvatarUpload"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <v-divider class="mb-6" />

              <!-- Profile Form Inputs -->
              <v-form ref="profileFormRef" @submit.prevent="saveProfile">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="profileForm.full_name"
                      label="Full Name"
                      variant="outlined"
                      prepend-inner-icon="mdi-account-outline"
                      :rules="[v => !!v || 'Name is required']"
                      required
                    />
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="profileForm.email"
                      label="Email Address"
                      variant="outlined"
                      prepend-inner-icon="mdi-email-outline"
                      :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                      required
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      v-model="profileForm.headline"
                      label="Headline / Professional Title"
                      placeholder="e.g. Full Stack Developer | Instructor at Online Pathshala"
                      variant="outlined"
                      prepend-inner-icon="mdi-card-text-outline"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="profileForm.phone"
                      label="Phone Number"
                      placeholder="e.g. +1 (555) 000-0000"
                      variant="outlined"
                      prepend-inner-icon="mdi-phone-outline"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="profileForm.gender"
                      label="Gender"
                      :items="['Male', 'Female', 'Non-binary', 'Prefer not to say']"
                      variant="outlined"
                      prepend-inner-icon="mdi-gender-male-female"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      v-model="profileForm.address"
                      label="Location / Address"
                      placeholder="e.g. San Francisco, CA"
                      variant="outlined"
                      prepend-inner-icon="mdi-map-marker-outline"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="profileForm.bio"
                      label="Biography"
                      placeholder="Tell us about yourself, your skills, achievements, and teaching/learning goals."
                      variant="outlined"
                      prepend-inner-icon="mdi-text-box-outline"
                      rows="4"
                    />
                  </v-col>
                </v-row>

                <div class="d-flex justify-end mt-4">
                  <v-btn
                    type="submit"
                    class="btn-gradient px-8"
                    size="large"
                    :loading="savingProfile"
                  >
                    Save Changes
                  </v-btn>
                </div>
              </v-form>
            </v-card>
          </v-window-item>

          <!-- Social Links Form -->
          <v-window-item value="socials">
            <v-card class="glass-panel section-card pa-6 pa-md-8" flat>
              <h2 class="text-h5 font-weight-bold mb-3 text-strong">Social Profiles</h2>
              <p class="app-section-copy mb-6">
                Link your social handles and personal website so others in the community can connect with you.
              </p>

              <v-form @submit.prevent="saveProfile">
                <v-text-field
                  v-model="profileForm.website_url"
                  label="Personal Website"
                  placeholder="https://yourwebsite.com"
                  variant="outlined"
                  prepend-inner-icon="mdi-earth"
                  class="mb-4"
                />

                <v-text-field
                  v-model="profileForm.github_url"
                  label="GitHub"
                  placeholder="https://github.com/username"
                  variant="outlined"
                  prepend-inner-icon="mdi-github"
                  class="mb-4"
                />

                <v-text-field
                  v-model="profileForm.linkedin_url"
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  variant="outlined"
                  prepend-inner-icon="mdi-linkedin"
                  class="mb-4"
                />

                <v-text-field
                  v-model="profileForm.twitter_url"
                  label="Twitter / X"
                  placeholder="https://twitter.com/username"
                  variant="outlined"
                  prepend-inner-icon="mdi-twitter"
                  class="mb-4"
                />

                <v-text-field
                  v-model="profileForm.youtube_url"
                  label="YouTube"
                  placeholder="https://youtube.com/c/channelname"
                  variant="outlined"
                  prepend-inner-icon="mdi-youtube"
                  class="mb-6"
                />

                <div class="d-flex justify-end mt-4">
                  <v-btn
                    type="submit"
                    class="btn-gradient px-8"
                    size="large"
                    :loading="savingProfile"
                  >
                    Save Links
                  </v-btn>
                </div>
              </v-form>
            </v-card>
          </v-window-item>

          <!-- Password & Security Form -->
          <v-window-item value="security">
            <v-card class="glass-panel section-card pa-6 pa-md-8" flat>
              <h2 class="text-h5 font-weight-bold mb-3 text-strong">Change Password</h2>
              <p class="app-section-copy mb-6">
                Ensure your account is protected by using a strong, unique password.
              </p>

              <v-form ref="securityFormRef" @submit.prevent="savePassword">
                <v-text-field
                  v-model="securityForm.oldPassword"
                  label="Current Password"
                  type="password"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-outline"
                  :rules="[v => !!v || 'Current password is required']"
                  required
                  class="mb-4"
                />

                <v-text-field
                  v-model="securityForm.newPassword"
                  label="New Password"
                  type="password"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-reset"
                  :rules="[
                    v => !!v || 'New password is required',
                    v => (v && v.length >= 6) || 'Password must be at least 6 characters'
                  ]"
                  required
                  class="mb-4"
                />

                <v-text-field
                  v-model="securityForm.confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :rules="[
                    v => !!v || 'Please confirm your new password',
                    v => v === securityForm.newPassword || 'Passwords do not match'
                  ]"
                  required
                  class="mb-6"
                />

                <div class="d-flex justify-end mt-4">
                  <v-btn
                    type="submit"
                    class="btn-gradient px-8"
                    size="large"
                    :loading="savingPassword"
                  >
                    Update Password
                  </v-btn>
                </div>
              </v-form>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import { toast } from '../../plugins/toast';

export default {
  data() {
    return {
      activeTab: 'profile',
      savingProfile: false,
      savingPassword: false,
      profileForm: {
        full_name: '',
        email: '',
        avatar_url: '',
        headline: '',
        bio: '',
        website_url: '',
        twitter_url: '',
        linkedin_url: '',
        github_url: '',
        youtube_url: '',
        phone: '',
        address: '',
        gender: ''
      },
      securityForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      premiumAvatars: [
        'https://api.dicebear.com/7.x/micah/svg?seed=Oliver',
        'https://api.dicebear.com/7.x/micah/svg?seed=Felix',
        'https://api.dicebear.com/7.x/micah/svg?seed=Jack',
        'https://api.dicebear.com/7.x/micah/svg?seed=Maya',
        'https://api.dicebear.com/7.x/micah/svg?seed=Aria',
        'https://api.dicebear.com/7.x/micah/svg?seed=Chloe',
        'https://api.dicebear.com/7.x/micah/svg?seed=Leo',
        'https://api.dicebear.com/7.x/micah/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/micah/svg?seed=Max',
        'https://api.dicebear.com/7.x/micah/svg?seed=Lily',
        'https://api.dicebear.com/7.x/micah/svg?seed=Finn',
        'https://api.dicebear.com/7.x/micah/svg?seed=Milo'
      ]
    };
  },
  computed: {
    ...mapGetters(['user']),
    userInitials() {
      if (!this.profileForm.full_name) return '?';
      return this.profileForm.full_name
        .split(' ')
        .map(n => n.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.profileForm = {
            full_name: val.full_name || '',
            email: val.email || '',
            avatar_url: val.avatar_url || '',
            headline: val.headline || '',
            bio: val.bio || '',
            website_url: val.website_url || '',
            twitter_url: val.twitter_url || '',
            linkedin_url: val.linkedin_url || '',
            github_url: val.github_url || '',
            youtube_url: val.youtube_url || '',
            phone: val.phone || '',
            address: val.address || '',
            gender: val.gender || ''
          };
        }
      }
    }
  },
  async created() {
    if (!this.user) {
      await this.$store.dispatch('fetchingUser');
    }
  },
  methods: {
    selectPremiumAvatar(url) {
      this.profileForm.avatar_url = url;
    },
    handleAvatarUpload(event) {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 250;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.8);
              this.uploadAvatarToBackend(compressed);
            }
          };
          img.src = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    },
    async uploadAvatarToBackend(base64Image) {
      toast.info('Uploading image...');
      try {
        const response = await axios.post('/user/upload-avatar', { image: base64Image });
        const uploadedUrl = response.data.data.url;
        this.profileForm.avatar_url = uploadedUrl;
        toast.success('Image uploaded successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to host image. Please try again.');
      }
    },
    async saveProfile() {
      const { valid } = this.$refs.profileFormRef ? await this.$refs.profileFormRef.validate() : { valid: true };
      if (!valid) {
        toast.error('Please correct form errors before saving.');
        return;
      }

      this.savingProfile = true;
      try {
        await axios.put('/user/update', this.profileForm);
        await this.$store.dispatch('fetchingUser');
        toast.success('Profile updated successfully!');
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || 'Error updating profile details.';
        toast.error(errMsg);
      } finally {
        this.savingProfile = false;
      }
    },
    async savePassword() {
      const { valid } = await this.$refs.securityFormRef.validate();
      if (!valid) {
        toast.error('Please fill in password fields correctly.');
        return;
      }

      this.savingPassword = true;
      try {
        await axios.put('/user/update-password', {
          oldPassword: this.securityForm.oldPassword,
          newPassword: this.securityForm.newPassword
        });
        toast.success('Password updated successfully!');
        this.securityForm.oldPassword = '';
        this.securityForm.newPassword = '';
        this.securityForm.confirmPassword = '';
        this.$refs.securityFormRef.resetValidation();
      } catch (err) {
        console.error(err);
        const errMsg = err.response?.data?.message || 'Error updating password. Confirm credentials.';
        toast.error(errMsg);
      } finally {
        this.savingPassword = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-tabs {
  background: transparent !important;
}

.profile-tabs :deep(.v-btn) {
  letter-spacing: normal;
  font-weight: 600;
  color: var(--text-main);
  opacity: 0.8;
  border-radius: var(--r-sm) !important;
  margin-bottom: 4px;
}

.profile-tabs :deep(.v-btn--active) {
  color: var(--brand-2) !important;
  background: var(--grad-primary-soft) !important;
  opacity: 1;
}

.avatar-preview-container {
  padding: 4px;
  border-radius: 50%;
  background: var(--grad-primary);
  box-shadow: var(--shadow-glow);
}

.profile-preview-avatar {
  border: 4px solid var(--surface);
  background: var(--surface-2);
  color: var(--brand-2);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  max-width: 380px;
}

@media (max-width: 480px) {
  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.avatar-option {
  border: 3px solid transparent;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: var(--surface-2);
}

.avatar-option:hover {
  transform: scale(1.15) rotate(4deg);
  border-color: var(--brand-2);
}

.avatar-selected {
  border-color: var(--brand-2) !important;
  transform: scale(1.15);
  box-shadow: var(--shadow-md);
  outline: 2px solid rgba(99, 102, 241, 0.3);
}

.custom-avatar-file-input {
  max-width: 240px;
}

.text-strong {
  color: var(--text-strong);
}
</style>
