<template>
  <dropdown-menu v-model:open="open">
    <dropdown-menu-trigger as-child>
      <button
        class="relative grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
        :title="unread ? `${unread} unread notification${unread === 1 ? '' : 's'}` : 'Notifications'"
      >
        <app-icon name="lucide:bell" size="20" />
        <span
          v-if="unread > 0"
          class="absolute top-0.5 right-0.5 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground"
        >
          {{ unread > 9 ? '9+' : unread }}
        </span>
      </button>
    </dropdown-menu-trigger>

    <dropdown-menu-content align="end" class="w-80 rounded-2xl p-2">
      <div class="flex items-center justify-between px-3 py-2">
        <span class="font-bold">Notifications</span>
        <button
          v-if="unread > 0"
          class="text-xs font-semibold text-primary transition-opacity hover:opacity-80"
          @click.stop="markAllRead"
        >
          Mark all read
        </button>
      </div>
      <dropdown-menu-separator />

      <div class="max-h-96 overflow-y-auto">
        <dropdown-menu-item
          v-for="item in notifications"
          :key="item.id"
          class="cursor-pointer flex-col items-start gap-0.5 rounded-xl px-3 py-2.5"
          :class="item.is_read ? '' : 'bg-primary/[0.07]'"
          @click="openNotification(item)"
        >
          <div class="flex w-full items-start gap-2">
            <app-icon :name="iconFor(item.type)" size="16" class="mt-0.5 shrink-0 text-primary" />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold">{{ item.title }}</div>
              <div v-if="item.body" class="line-clamp-2 text-xs text-muted-foreground">
                {{ item.body }}
              </div>
              <div class="mt-0.5 text-[0.68rem] text-muted-foreground">
                {{ formatDate(item.created_at) }}
              </div>
            </div>
            <span v-if="!item.is_read" class="mt-1.5 size-2 shrink-0 rounded-full bg-primary"></span>
          </div>
        </dropdown-menu-item>

        <p v-if="!notifications.length" class="px-3 py-6 text-center text-sm text-muted-foreground">
          Nothing yet — answers, announcements and certificates land here.
        </p>
      </div>
    </dropdown-menu-content>
  </dropdown-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

/** How often the bell re-checks for new notifications. */
const POLL_MS = 60000

const ICONS = {
  announcement: 'lucide:megaphone',
  'qna-answer': 'lucide:message-square-reply',
  certificate: 'lucide:award'
}

export default {
  name: 'NotificationBell',
  components: {
    AppIcon,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
  },
  data() {
    return { open: false, pollTimer: null }
  },
  computed: {
    ...mapGetters(['notifications']),
    unread() {
      return this.$store.getters.unreadNotifications || 0
    },
  },
  created() {
    this.$store.dispatch('fetchNotifications')
    this.pollTimer = setInterval(() => this.$store.dispatch('fetchNotifications'), POLL_MS)
  },
  beforeUnmount() {
    if (this.pollTimer) clearInterval(this.pollTimer)
  },
  methods: {
    iconFor(type) {
      return ICONS[type] || 'lucide:bell'
    },
    async openNotification(item) {
      this.open = false
      if (!item.is_read) {
        try {
          await this.$store.dispatch('markNotificationRead', item.id)
        } catch (error) {
          console.error(error)
        }
      }
      if (item.link) this.$router.push(item.link)
    },
    async markAllRead() {
      try {
        await this.$store.dispatch('markAllNotificationsRead')
      } catch (error) {
        console.error(error)
      }
    },
    formatDate(value) {
      if (!value) return ''
      return new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    },
  },
}
</script>
