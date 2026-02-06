import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, YStack } from 'tamagui';
import { Button, Text, Heading } from '@ahub/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View flex={1} backgroundColor="$background">
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            padding="$4"
            gap="$4"
          >
            <View
              width={64}
              height={64}
              borderRadius="$full"
              backgroundColor="$errorBackground"
              alignItems="center"
              justifyContent="center"
            >
              <Text size="2xl">!</Text>
            </View>

            <Heading level={3} align="center">
              Algo deu errado
            </Heading>

            <Text color="secondary" align="center">
              Ocorreu um erro inesperado. Tente novamente.
            </Text>

            <Button
              variant="primary"
              size="lg"
              onPress={this.handleReset}
            >
              Tentar novamente
            </Button>
          </YStack>
        </View>
      );
    }

    return this.props.children;
  }
}
