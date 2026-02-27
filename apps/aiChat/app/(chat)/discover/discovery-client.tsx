"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from "@uxin/ui";
import Link from "next/link";
import { FileText, Code, Image as ImageIcon, Table, File } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Document, User } from "@/lib/db/schema";

interface DiscoveryClientProps {
  publicDocuments: (Document & { user: User })[];
}

export function DiscoveryClient({ publicDocuments }: DiscoveryClientProps) {
  const { t } = useTranslation("discover");

  const getIcon = (kind: string) => {
    switch (kind) {
      case 'text': return <FileText className="h-6 w-6" />;
      case 'code': return <Code className="h-6 w-6" />;
      case 'image': return <ImageIcon className="h-6 w-6" />;
      case 'sheet': return <Table className="h-6 w-6" />;
      default: return <File className="h-6 w-6" />;
    }
  };

  const getKindLabel = (kind: string) => {
    switch (kind) {
        case 'text': return t('kind.text');
        case 'code': return t('kind.code');
        case 'image': return t('kind.image');
        case 'sheet': return t('kind.sheet');
        default: return t('kind.unknown');
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publicDocuments.map((doc) => (
          <Card key={doc.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader className="flex-row gap-4 items-start space-y-0">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {getIcon(doc.kind || 'text')}
              </div>
              <div className="space-y-1 flex-1">
                <CardTitle className="text-lg leading-tight line-clamp-1">{doc.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {doc.content?.substring(0, 100) || t('no_preview')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{doc.user.name}</span>
                <span>•</span>
                <span>{getKindLabel(doc.kind || 'unknown')}</span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Link href={`/discover/${doc.id}`} className="w-full">
                <Button className="w-full gap-2">
                  {t('view_document')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}

        {publicDocuments.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {t('no_documents')}
          </div>
        )}
      </div>
    </div>
  );
}
