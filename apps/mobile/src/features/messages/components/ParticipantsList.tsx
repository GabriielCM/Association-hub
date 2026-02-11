import { Pressable, FlatList } from 'react-native';
import { XStack, YStack, View } from 'tamagui';
import { Text, Avatar, Badge } from '@ahub/ui';
import type { ConversationParticipant } from '@ahub/shared/types';
import { OnlineStatus } from './OnlineStatus';

interface ParticipantsListProps {
  participants: ConversationParticipant[];
  currentUserId?: string;
  isAdmin?: boolean;
  onRemove?: (userId: string) => void;
  onPromote?: (userId: string) => void;
  onParticipantPress?: (userId: string) => void;
}

export function ParticipantsList({
  participants,
  currentUserId,
  isAdmin = false,
  onRemove,
  onPromote,
  onParticipantPress,
}: ParticipantsListProps) {
  const renderItem = ({
    item,
  }: {
    item: ConversationParticipant;
  }) => {
    const isMe = item.id === currentUserId;
    const isParticipantAdmin = item.role === 'ADMIN';

    return (
      <Pressable onPress={() => onParticipantPress?.(item.id)}>
        <XStack
          alignItems="center"
          gap="$2.5"
          paddingVertical="$2"
          paddingHorizontal="$3"
        >
          {/* Avatar with online indicator */}
          <View position="relative">
            <Avatar src={item.avatarUrl} name={item.name} size="sm" />
            <View position="absolute" bottom={0} right={0}>
              <OnlineStatus isOnline={item.isOnline} size={10} />
            </View>
          </View>

          {/* Name + role */}
          <YStack flex={1}>
            <XStack alignItems="center" gap="$1">
              <Text weight="medium" size="sm" numberOfLines={1}>
                {item.name}
                {isMe ? ' (Você)' : ''}
              </Text>
              {isParticipantAdmin && (
                <Badge variant="primary" size="sm">
                  Admin
                </Badge>
              )}
            </XStack>
            {!item.isOnline && item.lastSeenAt && (
              <Text color="secondary" size="xs">
                Visto por último{' '}
                {new Date(item.lastSeenAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </YStack>

          {/* Admin actions */}
          {isAdmin && !isMe && (
            <XStack gap="$2">
              {!isParticipantAdmin && onPromote && (
                <Pressable onPress={(e) => { e.stopPropagation(); onPromote(item.id); }}>
                  <Text color="primary" size="xs">
                    Admin
                  </Text>
                </Pressable>
              )}
              {onRemove && (
                <Pressable onPress={(e) => { e.stopPropagation(); onRemove(item.id); }}>
                  <Text color="error" size="xs">
                    Remover
                  </Text>
                </Pressable>
              )}
            </XStack>
          )}
        </XStack>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      scrollEnabled={false}
    />
  );
}
