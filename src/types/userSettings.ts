export interface UserSettings {
  id: string;
  user_id: string;
  display_mode: 'grid' | 'list';
  list_columns: 1 | 2 | 3 | 4;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUI {
  displayMode: 'grid' | 'list';
  listColumns: 1 | 2 | 3 | 4;
}

// DB用データをUI用データに変換
export const convertUserSettingsToUI = (settings: UserSettings): UserSettingsUI => ({
  displayMode: settings.display_mode,
  listColumns: settings.list_columns,
});

// UI用データをDB用データに変換
export const convertUserSettingsToDB = (settings: UserSettingsUI, userId: string): Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  display_mode: settings.displayMode,
  list_columns: settings.listColumns,
});