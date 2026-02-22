-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'DISPLAY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('EVENT_CHECKIN', 'STRAVA_ACTIVITY', 'DAILY_POST', 'TRANSFER_IN', 'SHOP_CASHBACK', 'PDV_CASHBACK', 'ADMIN_CREDIT', 'SHOP_PURCHASE', 'PDV_PURCHASE', 'JUKEBOX_PAYMENT', 'TRANSFER_OUT', 'ADMIN_DEBIT', 'REFUND', 'CHECK_IN', 'STRAVA', 'PURCHASE_POINTS', 'PURCHASE_PIX', 'CASHBACK', 'SUBSCRIPTION_BONUS', 'REFERRAL', 'MANUAL_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubscriptionAction" AS ENUM ('SUBSCRIBED', 'CHANGED', 'CANCELLED', 'SUSPENDED', 'REACTIVATED', 'RENEWED');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('ALL', 'SUBSCRIBERS', 'NON_SUBSCRIBERS', 'SPECIFIC_PLANS');

-- CreateEnum
CREATE TYPE "CardUsageType" AS ENUM ('CHECKIN', 'BENEFIT_USED', 'EVENT_VALIDATION', 'QR_SCANNED');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('SOCIAL', 'SPORTS', 'CULTURAL', 'EDUCATIONAL', 'NETWORKING', 'GASTRO', 'MUSIC', 'ART', 'GAMES', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ONGOING', 'ENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "BadgeCriteria" AS ENUM ('FIRST_CHECKIN', 'ALL_CHECKINS', 'AT_LEAST_ONE');

-- CreateEnum
CREATE TYPE "EventCommentContentType" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('SOCIAL', 'EVENTS', 'POINTS', 'RESERVATIONS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_LIKE', 'NEW_COMMENT', 'COMMENT_REPLY', 'MENTION', 'NEW_FOLLOWER', 'STORY_VIEW', 'POLL_ENDED', 'NEW_EVENT', 'EVENT_REMINDER_1DAY', 'EVENT_REMINDER_1HOUR', 'EVENT_STARTED', 'CHECKIN_REMINDER', 'BADGE_EARNED', 'EVENT_CANCELLED', 'EVENT_UPDATED', 'CHECKIN_PROGRESS', 'POINTS_RECEIVED', 'POINTS_SPENT', 'RANKING_UP', 'TRANSFER_RECEIVED', 'STRAVA_SYNC', 'RESERVATION_APPROVED', 'RESERVATION_REJECTED', 'RESERVATION_REMINDER', 'WAITLIST_AVAILABLE', 'NEW_MESSAGE', 'NEW_BENEFIT', 'CARD_BLOCKED', 'CARD_UNBLOCKED', 'ADMIN_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MessageContentType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENDING', 'SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "PdvStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PdvCheckoutStatus" AS ENUM ('PENDING', 'AWAITING_PIX', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PdvPaymentMethod" AS ENUM ('POINTS', 'PIX');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'VOUCHER', 'SERVICE');

-- CreateEnum
CREATE TYPE "PaymentOptions" AS ENUM ('POINTS_ONLY', 'MONEY_ONLY', 'BOTH');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('STORE', 'PDV');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('POINTS', 'MONEY', 'MIXED');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PHYSICAL', 'VOUCHER', 'SERVICE');

-- CreateEnum
CREATE TYPE "SpaceStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BookingPeriodType" AS ENUM ('DAY', 'SHIFT', 'HOUR');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('BUG', 'SUGGESTION', 'QUESTION');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ChatSessionStatus" AS ENUM ('QUEUED', 'ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('USER', 'SUPPORT', 'AGENT');

-- CreateEnum
CREATE TYPE "StoryType" AS ENUM ('IMAGE', 'VIDEO', 'TEXT');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('PHOTO', 'POLL', 'EVENT');

-- CreateEnum
CREATE TYPE "FeedReactionType" AS ENUM ('HEART', 'THUMBS_UP', 'LAUGH', 'WOW');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'INAPPROPRIATE', 'HARASSMENT', 'MISINFORMATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('POST', 'COMMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "avatar_url" TEXT,
    "cover_image_url" TEXT,
    "phone" TEXT,
    "social_instagram" TEXT,
    "social_facebook" TEXT,
    "social_x" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "username_changed_at" TIMESTAMP(3),
    "encryption_public_key" TEXT,
    "encrypted_private_key" TEXT,
    "encrypted_private_key_nonce" TEXT,
    "encryption_key_salt" TEXT,
    "association_id" TEXT NOT NULL,
    "member_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#6366F1',
    "secondary_color" TEXT NOT NULL DEFAULT '#8B5CF6',
    "points_name" TEXT NOT NULL DEFAULT 'pontos',
    "cashback_percent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "strava_max_km_day" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_config" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "check_in_points" INTEGER NOT NULL DEFAULT 50,
    "daily_post_points" INTEGER NOT NULL DEFAULT 5,
    "referral_points" INTEGER NOT NULL DEFAULT 500,
    "strava_run_points_per_km" INTEGER NOT NULL DEFAULT 10,
    "strava_ride_points_per_km" INTEGER NOT NULL DEFAULT 5,
    "strava_walk_points_per_km" INTEGER NOT NULL DEFAULT 5,
    "strava_swim_points_per_km" INTEGER NOT NULL DEFAULT 15,
    "strava_hike_points_per_km" INTEGER NOT NULL DEFAULT 8,
    "strava_daily_limit_km" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "strava_eligible_types" TEXT[] DEFAULT ARRAY['Run', 'Ride', 'Walk', 'Swim', 'Hike']::TEXT[],
    "strava_enabled" BOOLEAN NOT NULL DEFAULT true,
    "daily_post_enabled" BOOLEAN NOT NULL DEFAULT true,
    "points_to_money_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "athlete_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "last_sync_at" TIMESTAMP(3),
    "km_used_today" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "km_used_date" TIMESTAMP(3),
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strava_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strava_activities" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "strava_activity_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "distance_km" DOUBLE PRECISION NOT NULL,
    "km_credited" DOUBLE PRECISION NOT NULL,
    "points_earned" INTEGER NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strava_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lifetime_earned" INTEGER NOT NULL DEFAULT 0,
    "lifetime_spent" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "source" "TransactionSource" NOT NULL,
    "source_id" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "related_user_id" TEXT,
    "refunded_transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_recipients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "last_transfer_at" TIMESTAMP(3) NOT NULL,
    "transfer_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "transfer_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_monthly" INTEGER NOT NULL,
    "icon_url" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "mutators" JSONB NOT NULL DEFAULT '{}',
    "points_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "store_discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pdv_discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "space_discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verified_badge" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscribers_count" INTEGER NOT NULL DEFAULT 0,
    "stripe_product_id" TEXT,
    "stripe_price_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" TEXT,
    "suspended_at" TIMESTAMP(3),
    "suspended_by" TEXT,
    "suspend_reason" TEXT,
    "stripe_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "plan_id" TEXT NOT NULL,
    "action" "SubscriptionAction" NOT NULL,
    "plan_name" TEXT NOT NULL,
    "details" JSONB,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon_url" TEXT NOT NULL,
    "criteria_type" TEXT NOT NULL,
    "criteria_value" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_cards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_number" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "status_reason" TEXT,
    "qr_code_hash" TEXT NOT NULL,
    "qr_code_data" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_categories" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'gift',
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "banner_url" TEXT,
    "benefit" TEXT NOT NULL,
    "instructions" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "whatsapp" TEXT,
    "business_hours" JSONB,
    "eligible_audiences" "AudienceType"[] DEFAULT ARRAY['ALL']::"AudienceType"[],
    "eligible_plan_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "show_locked" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_new" BOOLEAN NOT NULL DEFAULT true,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_usage_logs" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "partner_id" TEXT,
    "type" "CardUsageType" NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "metadata" JSONB,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "EventCategory" NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366F1',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location_name" TEXT NOT NULL,
    "location_address" TEXT,
    "banner_feed" TEXT,
    "banner_display" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "points_total" INTEGER NOT NULL,
    "checkins_count" INTEGER NOT NULL,
    "checkin_interval" INTEGER NOT NULL DEFAULT 30,
    "badge_id" TEXT,
    "badge_criteria" "BadgeCriteria" NOT NULL DEFAULT 'AT_LEAST_ONE',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "is_paused" BOOLEAN NOT NULL DEFAULT false,
    "cancel_reason" TEXT,
    "capacity" INTEGER,
    "external_link" TEXT,
    "qr_secret" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_confirmations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_checkins" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "checkin_number" INTEGER NOT NULL,
    "points_awarded" INTEGER NOT NULL,
    "badge_awarded" BOOLEAN NOT NULL DEFAULT false,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "manual_by" TEXT,
    "manual_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_comments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content_type" "EventCommentContentType" NOT NULL DEFAULT 'TEXT',
    "text" TEXT,
    "media_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "image_url" TEXT,
    "action_url" TEXT,
    "group_key" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "in_app_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "do_not_disturb_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "start_time" TEXT,
    "end_time" TEXT,
    "days_of_week" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "do_not_disturb_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "ConversationType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ConversationRole" NOT NULL DEFAULT 'MEMBER',
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "last_read_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_groups" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_type" "MessageContentType" NOT NULL DEFAULT 'TEXT',
    "media_url" TEXT,
    "media_duration" INTEGER,
    "encrypted_content" TEXT,
    "nonce" TEXT,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "reply_to_id" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_key_bundles" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "sender_public_key" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_key_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdvs" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "PdvStatus" NOT NULL DEFAULT 'ACTIVE',
    "display_config" JSONB NOT NULL DEFAULT '{}',
    "api_key" TEXT NOT NULL,
    "api_secret" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_products" (
    "id" TEXT NOT NULL,
    "pdv_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "price_points" INTEGER NOT NULL,
    "price_money" DECIMAL(10,2) NOT NULL,
    "category" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdv_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_categories" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdv_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_checkouts" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "pdv_id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "total_points" INTEGER NOT NULL,
    "total_money" DECIMAL(10,2) NOT NULL,
    "payment_method" "PdvPaymentMethod",
    "status" "PdvCheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "qr_code_url" TEXT,
    "stripe_payment_intent_id" TEXT,
    "pix_qr_code" TEXT,
    "pix_expires_at" TIMESTAMP(3),
    "paid_by_user_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "cashback_earned" INTEGER,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdv_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_sales" (
    "id" TEXT NOT NULL,
    "checkout_id" TEXT NOT NULL,
    "pdv_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "payment_method" "PdvPaymentMethod" NOT NULL,
    "total_points" INTEGER,
    "total_money" DECIMAL(10,2),
    "points_transaction_id" TEXT,
    "stripe_payment_id" TEXT,
    "cashback_earned" INTEGER,
    "cashback_transaction_id" TEXT,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdv_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_categories" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_products" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT,
    "long_description" TEXT,
    "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
    "price_points" INTEGER,
    "price_money" DECIMAL(10,2),
    "payment_options" "PaymentOptions" NOT NULL DEFAULT 'BOTH',
    "allow_mixed_payment" BOOLEAN NOT NULL DEFAULT true,
    "stock_type" TEXT NOT NULL DEFAULT 'limited',
    "stock_count" INTEGER,
    "limit_per_user" INTEGER,
    "cashback_percent" DECIMAL(5,2),
    "voucher_validity_days" INTEGER,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_promotional" BOOLEAN NOT NULL DEFAULT false,
    "promotional_price_points" INTEGER,
    "promotional_price_money" DECIMAL(10,2),
    "promotional_ends_at" TIMESTAMP(3),
    "eligible_plans" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pickup_location" TEXT,
    "average_rating" DECIMAL(2,1),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attributes" JSONB NOT NULL,
    "price_points" INTEGER,
    "price_money" DECIMAL(10,2),
    "stock_count" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderated_by" TEXT,
    "moderated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subtotal_points" INTEGER NOT NULL DEFAULT 0,
    "subtotal_money" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reserved_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price_points" INTEGER NOT NULL,
    "unit_price_money" DECIMAL(10,2) NOT NULL,
    "reserved_stock" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "source" "OrderSource" NOT NULL,
    "source_id" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "subtotal_points" INTEGER NOT NULL,
    "subtotal_money" DECIMAL(10,2) NOT NULL,
    "payment_method" "OrderPaymentMethod" NOT NULL,
    "points_used" INTEGER,
    "money_paid" DECIMAL(10,2),
    "cashback_earned" INTEGER,
    "stripe_payment_id" TEXT,
    "points_transaction_id" TEXT,
    "cashback_transaction_id" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "pickup_code" TEXT NOT NULL,
    "pickup_location" TEXT,
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "product_name" TEXT NOT NULL,
    "variant_name" TEXT,
    "product_image" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price_points" INTEGER NOT NULL,
    "unit_price_money" DECIMAL(10,2) NOT NULL,
    "total_points" INTEGER NOT NULL,
    "total_money" DECIMAL(10,2) NOT NULL,
    "type" "OrderItemType" NOT NULL DEFAULT 'PHYSICAL',
    "voucher_code" TEXT,
    "voucher_used" BOOLEAN NOT NULL DEFAULT false,
    "voucher_used_at" TIMESTAMP(3),
    "voucher_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "changed_by" TEXT,
    "changed_by_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_receipts" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "main_image_url" TEXT,
    "fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "period_type" "BookingPeriodType" NOT NULL DEFAULT 'DAY',
    "shifts" JSONB DEFAULT '[]',
    "opening_time" TEXT,
    "closing_time" TEXT,
    "min_duration_hours" INTEGER,
    "min_advance_days" INTEGER NOT NULL DEFAULT 1,
    "max_advance_days" INTEGER NOT NULL DEFAULT 60,
    "booking_interval_months" INTEGER NOT NULL DEFAULT 0,
    "blocked_weekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "blocked_space_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "SpaceStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_blocks" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "period_type" "BookingPeriodType" NOT NULL,
    "shift_name" TEXT,
    "shift_start" TEXT,
    "shift_end" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "total_fee" DECIMAL(10,2),
    "discount_applied" DECIMAL(5,2),
    "final_fee" DECIMAL(10,2),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_by_id" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "cancelled_by_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "expired_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_waitlist" (
    "id" TEXT NOT NULL,
    "space_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "period_type" "BookingPeriodType" NOT NULL,
    "shift_name" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "position" INTEGER NOT NULL,
    "notified_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "accepted" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "is_automatic" BOOLEAN NOT NULL DEFAULT false,
    "device_info" JSONB,
    "assigned_to_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_name" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_ratings" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "agent_id" TEXT,
    "status" "ChatSessionStatus" NOT NULL DEFAULT 'QUEUED',
    "queue_position" INTEGER,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "sender_type" "SenderType" NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_ratings" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_uploads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "type" "AttachmentType" NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "type" "StoryType" NOT NULL,
    "media_url" TEXT,
    "text" VARCHAR(280),
    "background_color" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_views" (
    "id" TEXT NOT NULL,
    "story_id" TEXT NOT NULL,
    "viewer_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "image_url" TEXT,
    "description" VARCHAR(500),
    "event_id" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "text" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "feed_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_comment_reactions" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "FeedReactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_comment_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "question" VARCHAR(200) NOT NULL,
    "duration_days" INTEGER,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "ends_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_options" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "text" VARCHAR(80) NOT NULL,
    "votes_count" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" TEXT NOT NULL,
    "poll_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "post_id" TEXT,
    "reason" "ReportReason" NOT NULL,
    "description" VARCHAR(500),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_suspensions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "association_id" TEXT NOT NULL,
    "suspended_by_id" TEXT NOT NULL,
    "reason" VARCHAR(500) NOT NULL,
    "duration_days" INTEGER,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3),
    "lifted_by_id" TEXT,
    "lifted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_suspensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_post_trackers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "first_post_id" TEXT,
    "points_awarded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_post_trackers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_member_id_key" ON "users"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "associations_slug_key" ON "associations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "points_config_association_id_key" ON "points_config"("association_id");

-- CreateIndex
CREATE UNIQUE INDEX "strava_connections_user_id_key" ON "strava_connections"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "strava_activities_strava_activity_id_key" ON "strava_activities"("strava_activity_id");

-- CreateIndex
CREATE INDEX "strava_activities_connection_id_activity_date_idx" ON "strava_activities"("connection_id", "activity_date");

-- CreateIndex
CREATE UNIQUE INDEX "user_points_user_id_key" ON "user_points"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "point_transactions_refunded_transaction_id_key" ON "point_transactions"("refunded_transaction_id");

-- CreateIndex
CREATE INDEX "point_transactions_user_id_created_at_idx" ON "point_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "point_transactions_user_id_source_idx" ON "point_transactions"("user_id", "source");

-- CreateIndex
CREATE INDEX "transfer_recipients_user_id_last_transfer_at_idx" ON "transfer_recipients"("user_id", "last_transfer_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "transfer_recipients_user_id_recipient_id_key" ON "transfer_recipients"("user_id", "recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_association_id_name_key" ON "subscription_plans"("association_id", "name");

-- CreateIndex
CREATE INDEX "user_subscriptions_user_id_status_idx" ON "user_subscriptions"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscriptions_user_id_key" ON "user_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscription_history_user_id_created_at_idx" ON "subscription_history"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_cards_user_id_key" ON "member_cards"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_cards_card_number_key" ON "member_cards"("card_number");

-- CreateIndex
CREATE UNIQUE INDEX "partner_categories_association_id_slug_key" ON "partner_categories"("association_id", "slug");

-- CreateIndex
CREATE INDEX "partners_association_id_category_id_idx" ON "partners"("association_id", "category_id");

-- CreateIndex
CREATE INDEX "card_usage_logs_card_id_scanned_at_idx" ON "card_usage_logs"("card_id", "scanned_at");

-- CreateIndex
CREATE INDEX "card_usage_logs_user_id_scanned_at_idx" ON "card_usage_logs"("user_id", "scanned_at");

-- CreateIndex
CREATE INDEX "events_association_id_status_idx" ON "events"("association_id", "status");

-- CreateIndex
CREATE INDEX "events_association_id_start_date_idx" ON "events"("association_id", "start_date");

-- CreateIndex
CREATE INDEX "event_confirmations_event_id_idx" ON "event_confirmations"("event_id");

-- CreateIndex
CREATE INDEX "event_confirmations_user_id_idx" ON "event_confirmations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_confirmations_event_id_user_id_key" ON "event_confirmations"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "event_checkins_event_id_created_at_idx" ON "event_checkins"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "event_checkins_user_id_created_at_idx" ON "event_checkins"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "event_checkins_event_id_user_id_checkin_number_key" ON "event_checkins"("event_id", "user_id", "checkin_number");

-- CreateIndex
CREATE INDEX "event_comments_event_id_created_at_idx" ON "event_comments"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_category_idx" ON "notifications"("user_id", "category");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_group_key_idx" ON "notifications"("group_key");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_category_key" ON "notification_settings"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "do_not_disturb_settings_user_id_key" ON "do_not_disturb_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_is_archived_idx" ON "conversation_participants"("user_id", "is_archived");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_groups_conversation_id_key" ON "conversation_groups"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_key" ON "message_reactions"("message_id", "user_id", "emoji");

-- CreateIndex
CREATE INDEX "conversation_key_bundles_user_id_idx" ON "conversation_key_bundles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_key_bundles_conversation_id_user_id_version_key" ON "conversation_key_bundles"("conversation_id", "user_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "pdvs_api_key_key" ON "pdvs"("api_key");

-- CreateIndex
CREATE INDEX "pdvs_association_id_status_idx" ON "pdvs"("association_id", "status");

-- CreateIndex
CREATE INDEX "pdv_products_pdv_id_is_active_idx" ON "pdv_products"("pdv_id", "is_active");

-- CreateIndex
CREATE INDEX "pdv_categories_association_id_idx" ON "pdv_categories"("association_id");

-- CreateIndex
CREATE UNIQUE INDEX "pdv_categories_association_id_name_key" ON "pdv_categories"("association_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pdv_checkouts_code_key" ON "pdv_checkouts"("code");

-- CreateIndex
CREATE INDEX "pdv_checkouts_pdv_id_status_idx" ON "pdv_checkouts"("pdv_id", "status");

-- CreateIndex
CREATE INDEX "pdv_checkouts_code_idx" ON "pdv_checkouts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "pdv_sales_checkout_id_key" ON "pdv_sales"("checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "pdv_sales_order_id_key" ON "pdv_sales"("order_id");

-- CreateIndex
CREATE INDEX "pdv_sales_pdv_id_created_at_idx" ON "pdv_sales"("pdv_id", "created_at");

-- CreateIndex
CREATE INDEX "pdv_sales_user_id_idx" ON "pdv_sales"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_categories_association_id_slug_key" ON "store_categories"("association_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "store_products_slug_key" ON "store_products"("slug");

-- CreateIndex
CREATE INDEX "store_products_category_id_is_active_idx" ON "store_products"("category_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_product_id_user_id_order_id_key" ON "product_reviews"("product_id", "user_id", "order_id");

-- CreateIndex
CREATE INDEX "product_favorites_user_id_idx" ON "product_favorites"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_favorites_user_id_product_id_key" ON "product_favorites"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_key" ON "cart_items"("cart_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_created_at_idx" ON "order_status_history"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_receipts_order_id_key" ON "order_receipts"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_receipts_receipt_number_key" ON "order_receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "spaces_association_id_status_idx" ON "spaces"("association_id", "status");

-- CreateIndex
CREATE INDEX "space_blocks_space_id_date_idx" ON "space_blocks"("space_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "space_blocks_space_id_date_key" ON "space_blocks"("space_id", "date");

-- CreateIndex
CREATE INDEX "bookings_space_id_date_status_idx" ON "bookings"("space_id", "date", "status");

-- CreateIndex
CREATE INDEX "bookings_user_id_created_at_idx" ON "bookings"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_space_id_date_period_type_shift_name_start_time_key" ON "bookings"("space_id", "date", "period_type", "shift_name", "start_time");

-- CreateIndex
CREATE INDEX "booking_waitlist_space_id_date_idx" ON "booking_waitlist"("space_id", "date");

-- CreateIndex
CREATE INDEX "booking_waitlist_user_id_idx" ON "booking_waitlist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_waitlist_space_id_date_period_type_shift_name_start_key" ON "booking_waitlist"("space_id", "date", "period_type", "shift_name", "start_time", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");

-- CreateIndex
CREATE INDEX "tickets_user_id_created_at_idx" ON "tickets"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "tickets_association_id_status_idx" ON "tickets"("association_id", "status");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_id_created_at_idx" ON "ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_ratings_ticket_id_key" ON "ticket_ratings"("ticket_id");

-- CreateIndex
CREATE INDEX "faq_items_association_id_is_active_category_order_idx" ON "faq_items"("association_id", "is_active", "category", "order");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_created_at_idx" ON "chat_sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_sessions_association_id_status_idx" ON "chat_sessions"("association_id", "status");

-- CreateIndex
CREATE INDEX "chat_sessions_agent_id_status_idx" ON "chat_sessions"("agent_id", "status");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_created_at_idx" ON "chat_messages"("session_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "chat_ratings_session_id_key" ON "chat_ratings"("session_id");

-- CreateIndex
CREATE INDEX "support_uploads_user_id_expires_at_idx" ON "support_uploads"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "stories_user_id_created_at_idx" ON "stories"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "stories_association_id_expires_at_idx" ON "stories"("association_id", "expires_at");

-- CreateIndex
CREATE INDEX "story_views_story_id_idx" ON "story_views"("story_id");

-- CreateIndex
CREATE UNIQUE INDEX "story_views_story_id_viewer_id_key" ON "story_views"("story_id", "viewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_event_id_key" ON "posts"("event_id");

-- CreateIndex
CREATE INDEX "posts_author_id_created_at_idx" ON "posts"("author_id", "created_at");

-- CreateIndex
CREATE INDEX "posts_association_id_created_at_idx" ON "posts"("association_id", "created_at");

-- CreateIndex
CREATE INDEX "posts_association_id_is_pinned_created_at_idx" ON "posts"("association_id", "is_pinned", "created_at");

-- CreateIndex
CREATE INDEX "post_likes_post_id_idx" ON "post_likes"("post_id");

-- CreateIndex
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_post_id_user_id_key" ON "post_likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "feed_comments_post_id_created_at_idx" ON "feed_comments"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "feed_comments_author_id_idx" ON "feed_comments"("author_id");

-- CreateIndex
CREATE INDEX "feed_comments_parent_id_idx" ON "feed_comments"("parent_id");

-- CreateIndex
CREATE INDEX "feed_comment_reactions_comment_id_idx" ON "feed_comment_reactions"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "feed_comment_reactions_comment_id_user_id_type_key" ON "feed_comment_reactions"("comment_id", "user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "polls_post_id_key" ON "polls"("post_id");

-- CreateIndex
CREATE INDEX "poll_options_poll_id_idx" ON "poll_options"("poll_id");

-- CreateIndex
CREATE INDEX "poll_votes_poll_id_idx" ON "poll_votes"("poll_id");

-- CreateIndex
CREATE INDEX "poll_votes_option_id_idx" ON "poll_votes"("option_id");

-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_poll_id_user_id_key" ON "poll_votes"("poll_id", "user_id");

-- CreateIndex
CREATE INDEX "reports_association_id_status_idx" ON "reports"("association_id", "status");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "user_suspensions_user_id_ends_at_idx" ON "user_suspensions"("user_id", "ends_at");

-- CreateIndex
CREATE INDEX "user_suspensions_association_id_idx" ON "user_suspensions"("association_id");

-- CreateIndex
CREATE INDEX "daily_post_trackers_user_id_date_idx" ON "daily_post_trackers"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_post_trackers_user_id_date_key" ON "daily_post_trackers"("user_id", "date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_config" ADD CONSTRAINT "points_config_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strava_connections" ADD CONSTRAINT "strava_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strava_activities" ADD CONSTRAINT "strava_activities_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "strava_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_refunded_transaction_id_fkey" FOREIGN KEY ("refunded_transaction_id") REFERENCES "point_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_cards" ADD CONSTRAINT "member_cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_categories" ADD CONSTRAINT "partner_categories_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "partner_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_usage_logs" ADD CONSTRAINT "card_usage_logs_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "member_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_usage_logs" ADD CONSTRAINT "card_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_usage_logs" ADD CONSTRAINT "card_usage_logs_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_confirmations" ADD CONSTRAINT "event_confirmations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_confirmations" ADD CONSTRAINT "event_confirmations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkins" ADD CONSTRAINT "event_checkins_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_checkins" ADD CONSTRAINT "event_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "do_not_disturb_settings" ADD CONSTRAINT "do_not_disturb_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_groups" ADD CONSTRAINT "conversation_groups_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_groups" ADD CONSTRAINT "conversation_groups_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_key_bundles" ADD CONSTRAINT "conversation_key_bundles_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_key_bundles" ADD CONSTRAINT "conversation_key_bundles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdv_products" ADD CONSTRAINT "pdv_products_pdv_id_fkey" FOREIGN KEY ("pdv_id") REFERENCES "pdvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdv_checkouts" ADD CONSTRAINT "pdv_checkouts_pdv_id_fkey" FOREIGN KEY ("pdv_id") REFERENCES "pdvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdv_sales" ADD CONSTRAINT "pdv_sales_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "pdv_checkouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdv_sales" ADD CONSTRAINT "pdv_sales_pdv_id_fkey" FOREIGN KEY ("pdv_id") REFERENCES "pdvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdv_sales" ADD CONSTRAINT "pdv_sales_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_products" ADD CONSTRAINT "store_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "store_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "store_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "store_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "store_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "store_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_favorites" ADD CONSTRAINT "product_favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "store_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_receipts" ADD CONSTRAINT "order_receipts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_blocks" ADD CONSTRAINT "space_blocks_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_waitlist" ADD CONSTRAINT "booking_waitlist_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_message_attachments" ADD CONSTRAINT "ticket_message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ticket_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_ratings" ADD CONSTRAINT "ticket_ratings_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_attachments" ADD CONSTRAINT "chat_message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_ratings" ADD CONSTRAINT "chat_ratings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "feed_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comment_reactions" ADD CONSTRAINT "feed_comment_reactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "feed_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comment_reactions" ADD CONSTRAINT "feed_comment_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_suspensions" ADD CONSTRAINT "user_suspensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_post_trackers" ADD CONSTRAINT "daily_post_trackers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.4.1                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
