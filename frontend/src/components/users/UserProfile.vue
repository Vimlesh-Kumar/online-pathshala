<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-10 p-6 md:p-10">
      <div class="eyebrow mb-4">Account Settings</div>
      <h1 class="app-section-title mb-3">Manage Your Profile</h1>
      <p class="text-muted-foreground">
        Update your personal information, links, avatar, and security credentials.
      </p>
    </section>

    <tabs v-model="activeTab" orientation="vertical" class="grid gap-6 md:grid-cols-12">
      <!-- Navigation -->
      <div class="md:col-span-3">
        <div class="glass-panel section-card p-4">
          <tabs-list class="flex h-auto w-full flex-row gap-1 bg-transparent p-0 md:flex-col">
            <tabs-trigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="w-full justify-start gap-2 rounded-xl px-3 py-3 font-semibold data-[state=active]:bg-primary/12 data-[state=active]:text-primary"
            >
              <app-icon :name="tab.icon" size="18" />
              <span class="hidden sm:inline">{{ tab.label }}</span>
            </tabs-trigger>
          </tabs-list>
        </div>
      </div>

      <!-- Content -->
      <div class="md:col-span-9">
        <!-- Profile general form -->
        <tabs-content value="profile" class="mt-0">
          <div class="glass-panel section-card p-6 md:p-8">
            <h2 class="mb-6 font-display text-2xl font-bold">Personal Information</h2>

            <!-- Avatar -->
            <div class="mb-8">
              <div class="mb-4 font-medium">Choose Your Avatar</div>

              <div class="flex flex-col items-center gap-6 sm:flex-row">
                <div
                  class="shrink-0 rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] p-1 shadow-[0_18px_40px_-14px_rgb(124_58_237_/_0.9)]"
                >
                  <div
                    class="grid size-25 place-items-center overflow-hidden rounded-full border-4 border-[var(--surface)] bg-[var(--surface-2)] text-3xl font-bold text-primary"
                  >
                    <img
                      v-if="profileForm.avatar_url"
                      :src="profileForm.avatar_url"
                      alt="Your avatar"
                      class="size-full object-cover"
                    />
                    <span v-else>{{ userInitials }}</span>
                  </div>
                </div>

                <div class="w-full flex-1">
                  <p class="mb-3 text-xs text-muted-foreground">
                    Choose from our premium colorful illustrations or upload a custom photo.
                  </p>

                  <div class="avatar-grid mb-4">
                    <button
                      v-for="(avatar, i) in premiumAvatars"
                      :key="i"
                      type="button"
                      class="avatar-option size-11.5 overflow-hidden rounded-full bg-[var(--surface-2)]"
                      :class="{ 'avatar-selected': profileForm.avatar_url === avatar }"
                      :aria-label="`Select avatar ${i + 1}`"
                      @click="selectPremiumAvatar(avatar)"
                    >
                      <img :src="avatar" alt="" class="size-full object-cover" />
                    </button>
                  </div>

                  <label
                    class="inline-flex max-w-60 cursor-pointer items-center gap-2 rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/50 dark:border-white/12"
                  >
                    <app-icon name="lucide:camera" size="18" />
                    Upload Custom Photo
                    <input type="file" accept="image/*" class="sr-only" @change="handleAvatarUpload" />
                  </label>
                </div>
              </div>
            </div>

            <separator class="mb-6" />

            <form novalidate @submit.prevent="saveProfile">
              <div class="grid gap-4 sm:grid-cols-2">
                <app-field
                  v-model="profileForm.full_name"
                  label="Full Name"
                  icon="lucide:user"
                  :error="profileTouched ? profileErrors.full_name : ''"
                  required
                />
                <app-field
                  v-model="profileForm.email"
                  label="Email Address"
                  type="email"
                  icon="lucide:mail"
                  :error="profileTouched ? profileErrors.email : ''"
                  required
                />
                <app-field
                  v-model="profileForm.headline"
                  class="sm:col-span-2"
                  label="Headline / Professional Title"
                  icon="lucide:id-card"
                  placeholder="e.g. Full Stack Developer | Instructor at Online Pathshala"
                />
                <app-field
                  v-model="profileForm.phone"
                  label="Phone Number"
                  icon="lucide:phone"
                  placeholder="e.g. +1 (555) 000-0000"
                />

                <div class="flex flex-col gap-1.5">
                  <span class="text-sm font-semibold">Gender</span>
                  <select-root v-model="profileForm.gender">
                    <select-trigger class="h-12 w-full rounded-2xl" aria-label="Gender">
                      <select-value placeholder="Select" />
                    </select-trigger>
                    <select-content class="rounded-2xl">
                      <select-item v-for="option in genders" :key="option" :value="option">
                        {{ option }}
                      </select-item>
                    </select-content>
                  </select-root>
                </div>

                <app-field
                  v-model="profileForm.address"
                  class="sm:col-span-2"
                  label="Location / Address"
                  icon="lucide:map-pin"
                  placeholder="e.g. San Francisco, CA"
                />
                <app-field
                  v-model="profileForm.bio"
                  class="sm:col-span-2"
                  label="Biography"
                  multiline
                  :rows="4"
                  placeholder="Tell us about yourself, your skills, achievements, and teaching/learning goals."
                />
              </div>

              <div class="mt-6 flex justify-end">
                <button type="submit" class="btn-brand px-8" :disabled="savingProfile">
                  <app-icon v-if="savingProfile" name="lucide:loader-circle" size="18" class="animate-spin" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </tabs-content>

        <!-- Social links -->
        <tabs-content value="socials" class="mt-0">
          <div class="glass-panel section-card p-6 md:p-8">
            <h2 class="mb-3 font-display text-2xl font-bold">Social Profiles</h2>
            <p class="mb-6 text-muted-foreground">
              Link your social handles and personal website so others in the community can connect with you.
            </p>

            <form novalidate @submit.prevent="saveProfile">
              <div v-for="link in socialFields" :key="link.key" class="mb-4">
                <app-field
                  v-model="profileForm[link.key]"
                  :label="link.label"
                  :icon="link.icon"
                  :placeholder="link.placeholder"
                />
                <!-- Reads the real profile behind the link: name, avatar, bio, counts. -->
                <social-link-preview :url="profileForm[link.key]" />
              </div>

              <div class="mt-6 flex justify-end">
                <button type="submit" class="btn-brand px-8" :disabled="savingProfile">
                  <app-icon v-if="savingProfile" name="lucide:loader-circle" size="18" class="animate-spin" />
                  Save Links
                </button>
              </div>
            </form>
          </div>
        </tabs-content>

        <!-- Password & security -->
        <tabs-content value="security" class="mt-0">
          <div class="glass-panel section-card p-6 md:p-8">
            <h2 class="mb-3 font-display text-2xl font-bold">Change Password</h2>
            <p class="mb-6 text-muted-foreground">
              Ensure your account is protected by using a strong, unique password.
            </p>

            <form novalidate @submit.prevent="savePassword">
              <app-field
                v-model="securityForm.oldPassword"
                class="mb-4"
                label="Current Password"
                type="password"
                icon="lucide:lock"
                :error="securityTouched ? securityErrors.oldPassword : ''"
                required
              />
              <app-field
                v-model="securityForm.newPassword"
                class="mb-4"
                label="New Password"
                type="password"
                icon="lucide:lock-keyhole"
                hint="At least 6 characters"
                :error="securityTouched ? securityErrors.newPassword : ''"
                required
              />
              <app-field
                v-model="securityForm.confirmPassword"
                class="mb-6"
                label="Confirm New Password"
                type="password"
                icon="lucide:shield-check"
                :error="securityTouched ? securityErrors.confirmPassword : ''"
                required
              />

              <div class="mt-4 flex justify-end">
                <button type="submit" class="btn-brand px-8" :disabled="savingPassword">
                  <app-icon v-if="savingPassword" name="lucide:loader-circle" size="18" class="animate-spin" />
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </tabs-content>
      </div>
    </tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import { toast } from '../../plugins/toast';
import AppField from '@/components/ui/AppField.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import SocialLinkPreview from '@/components/users/SocialLinkPreview.vue';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default {
  components: {
    AppField,
    AppIcon,
    SocialLinkPreview,
    Separator,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  },
  data() {
    return {
      activeTab: 'profile',
      savingProfile: false,
      savingPassword: false,
      profileTouched: false,
      securityTouched: false,
      tabs: [
        { value: 'profile', label: 'Edit Profile', icon: 'lucide:circle-user' },
        { value: 'socials', label: 'Social Profiles', icon: 'lucide:link' },
        { value: 'security', label: 'Password & Security', icon: 'lucide:shield-check' }
      ],
      genders: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
      socialFields: [
        { key: 'website_url', label: 'Personal Website', icon: 'lucide:globe', placeholder: 'https://yourwebsite.com' },
        { key: 'github_url', label: 'GitHub', icon: 'mdi:github', placeholder: 'https://github.com/username' },
        { key: 'linkedin_url', label: 'LinkedIn', icon: 'mdi:linkedin', placeholder: 'https://linkedin.com/in/username' },
        { key: 'twitter_url', label: 'Twitter / X', icon: 'mdi:twitter', placeholder: 'https://twitter.com/username' },
        { key: 'youtube_url', label: 'YouTube', icon: 'mdi:youtube', placeholder: 'https://youtube.com/c/channelname' }
      ],
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
    },
    // Replaces the per-field `:rules` arrays Vuetify's <v-form> used to collect.
    profileErrors() {
      return {
        full_name: this.profileForm.full_name ? '' : 'Name is required',
        email: !this.profileForm.email
          ? 'Email is required'
          : /.+@.+\..+/.test(this.profileForm.email) ? '' : 'E-mail must be valid'
      };
    },
    securityErrors() {
      const { oldPassword, newPassword, confirmPassword } = this.securityForm;
      return {
        oldPassword: oldPassword ? '' : 'Current password is required',
        newPassword: !newPassword
          ? 'New password is required'
          : newPassword.length >= 6 ? '' : 'Password must be at least 6 characters',
        confirmPassword: !confirmPassword
          ? 'Please confirm your new password'
          : confirmPassword === newPassword ? '' : 'Passwords do not match'
      };
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
    hasErrors(errors) {
      return Object.values(errors).some(Boolean);
    },
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
      this.profileTouched = true;
      if (this.hasErrors(this.profileErrors)) {
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
      this.securityTouched = true;
      if (this.hasErrors(this.securityErrors)) {
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
        this.securityTouched = false;
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
}

.avatar-option:hover {
  transform: scale(1.15) rotate(4deg);
  border-color: var(--brand-2);
}

.avatar-selected {
  border-color: var(--brand-2);
  transform: scale(1.15);
  box-shadow: var(--shadow-md);
  outline: 2px solid rgba(99, 102, 241, 0.3);
}
</style>
