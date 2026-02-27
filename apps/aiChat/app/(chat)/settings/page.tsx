"use client";

import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button
} from "@uxin/ui";
import { Moon, Sun, Monitor, Bell, Shield, User, Globe, Lock } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { t, i18n } = useTranslation(["settings", "common"]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('settingsTitle')}</h1>
        <p className="text-muted-foreground">{t('generalSettings')}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="general">{t('general')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('notificationSettings')}</TabsTrigger>
          <TabsTrigger value="about">{t('about')}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('interfaceLanguage')}
              </CardTitle>
              <CardDescription>
                {t('selectLanguage')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={i18n.language} onValueChange={changeLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('dataControl')}
              </CardTitle>
              <CardDescription>
                {t('chatHistoryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('autoArchive')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('autoArchiveDesc')}
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('chatHistory')}</Label>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                {t('themeMode')}
              </CardTitle>
              <CardDescription>
                {t('appearanceSettings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-24"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-6 w-6" />
                  {t('light')}
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-24"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-6 w-6" />
                  {t('dark')}
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-24"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-6 w-6" />
                  {t('system')}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
               <CardTitle>{t('accessibilitySettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('highContrast')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('highContrastDesc')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('notificationSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('desktopNotify')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('desktopNotifyDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('soundNotify')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('soundNotifyDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('emailNotify')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('emailNotifyDesc')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Settings */}
        <TabsContent value="about" className="space-y-4 mt-4">
           <Card>
            <CardHeader>
              <CardTitle>{t('aboutUxin')}</CardTitle>
              <CardDescription>{t('version')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('aboutDesc')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('daoDesc')}
              </p>
              <div className="flex flex-col gap-2 pt-4">
                 <Button variant="link" className="justify-start px-0 h-auto">
                   {t('userAgreement')}
                 </Button>
                 <Button variant="link" className="justify-start px-0 h-auto">
                   {t('privacyPolicy')}
                 </Button>
                 <Button variant="link" className="justify-start px-0 h-auto">
                   {t('contactUs')}
                 </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
