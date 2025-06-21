// App Status Service
// Real production utility for checking app health and user status
import { DatabaseHealthCheck } from '../utils/DatabaseHealthCheck';
import { AuthHelper } from '../utils/AuthHelper';
import { FounderService } from './FounderService';

// Define interfaces for app status
interface ServiceStatus {
  status: string;
  message: string;
  error?: string;
}

interface Services {
  database?: ServiceStatus;
  schema?: ServiceStatus;
  auth?: ServiceStatus;
  [key: string]: ServiceStatus | undefined;
}

interface HealthCheckResult {
  timestamp: string;
  overall: string;
  services: Services;
  error?: string;
}

interface UserOnboardingStatus {
  status: string;
  message: string;
  needsOnboarding?: boolean;
  profileProgress?: number;
  user?: {
    id: string;
    email?: string;
    full_name?: string;
    onboarding_completed?: boolean;
  };
}

interface AppDiagnostic {
  timestamp: string;
  app: {
    version: string;
    build: string;
    environment: "development" | "production" | "test";
  };
  health: HealthCheckResult;
  user?: UserOnboardingStatus;
  recommendations?: string[];
}

export class AppStatusService {
  static async checkAppHealth(): Promise<HealthCheckResult> {
    const results: HealthCheckResult = {
      timestamp: new Date().toISOString(),
      overall: 'checking',
      services: {}
    };

    try {
      // Check database connection
      results.services.database = await DatabaseHealthCheck.checkConnection();
      
      // Check database schema
      results.services.schema = await DatabaseHealthCheck.checkSchema();
      
      // Check auth service
      const authCheck = await AuthHelper.getCurrentSession();
      results.services.auth = {
        status: authCheck.success ? 'connected' : 'error',
        message: authCheck.success ? 'Auth service available' : authCheck.error
      };

      // Determine overall status
      const allServicesOk = Object.values(results.services).every(
        service => service.status === 'connected' || service.status === 'schema_ok'
      );
      
      results.overall = allServicesOk ? 'healthy' : 'degraded';

    } catch (error) {
      results.overall = 'error';
      results.error = error.message;
    }

    return results;
  }

  static async checkUserOnboardingStatus(userId: string): Promise<UserOnboardingStatus> {
    if (!userId) {
      return {
        status: 'no_user',
        message: 'No user ID provided'
      };
    }

    try {
      // Get founder data
      const founderResult = await FounderService.getFounder(userId);
      
      if (!founderResult.success) {
        if (founderResult.code === 'NOT_FOUND') {
          return {
            status: 'new_user',
            message: 'User needs to complete onboarding',
            needsOnboarding: true
          };
        }
        
        return {
          status: 'error',
          message: founderResult.error,
          needsOnboarding: true
        };
      }

      const founder = founderResult.data;
      
      return {
        status: 'found',
        message: 'User profile found',
        needsOnboarding: !founder.onboarding_completed,
        profileProgress: founder.profile_progress,
        user: {
          id: founder.id,
          email: founder.email,
          full_name: founder.full_name,
          onboarding_completed: founder.onboarding_completed
        }
      };

    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        needsOnboarding: true
      };
    }
  }

  static async getAppVersion() {
    // This would typically come from your app's package.json or environment
    return {
      version: '1.0.0',
      build: process.env.EXPO_PUBLIC_APP_VERSION || 'development',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  static async runFullDiagnostic(userId: string | null = null): Promise<AppDiagnostic> {
    const diagnostic: AppDiagnostic = {
      timestamp: new Date().toISOString(),
      app: await this.getAppVersion(),
      health: await this.checkAppHealth(),
    };

    if (userId) {
      diagnostic.user = await this.checkUserOnboardingStatus(userId);
    }

    // Add recommendations based on status
    diagnostic.recommendations = this.generateRecommendations(diagnostic);

    return diagnostic;
  }

  static generateRecommendations(diagnostic: AppDiagnostic) {
    const recommendations = [];

    // Database recommendations
    if (diagnostic.health.services.database?.status !== 'connected') {
      recommendations.push({
        type: 'database',
        level: 'critical',
        message: 'Database connection failed. Check network connectivity.',
        action: 'retry_connection'
      });
    }

    if (diagnostic.health.services.schema?.status === 'schema_missing') {
      recommendations.push({
        type: 'schema',
        level: 'critical',
        message: 'Database schema is incomplete. Run migrations.',
        action: 'run_migration'
      });
    }

    // User recommendations
    if (diagnostic.user?.needsOnboarding) {
      recommendations.push({
        type: 'onboarding',
        level: 'info',
        message: 'User needs to complete profile setup.',
        action: 'show_onboarding'
      });
    }

    // Auth recommendations
    if (diagnostic.health.services.auth?.status !== 'connected') {
      recommendations.push({
        type: 'auth',
        level: 'warning',
        message: 'Authentication service unavailable.',
        action: 'check_auth'
      });
    }

    return recommendations;
  }
}
