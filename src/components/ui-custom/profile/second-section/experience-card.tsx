"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Certification, Profile } from "@/lib/data/data";

interface CertificationProps {
  certificationProp?: Certification[];
  profile?: Profile;
  className?: string;
}

export function CertificatesCard({
  certificationProp = [],
  profile,
  className = "",
}: CertificationProps) {
  return (
    <Card className={`w-full overflow-hidden border shadow-md ${className}`}>
      <CardHeader className="p-4 flex-none h-full">
        <Tabs defaultValue="certificates" className="w-full h-full ">
          <div>
            <TabsList className="w-full flex flex-col sm:flex-row gap-2 sm:gap-1 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="certificates"
                className="w-full py-3 px-4 rounded-md border shadow-sm data-[state=active]:border-primary/50 data-[state=active]:bg-custom-button-green data-[state=active]:border-transparent data-[state=active]:text-primary-foreground hover:bg-muted/80 transition-all"
              >
                Verified certificates
              </TabsTrigger>
              <TabsTrigger
                value="bio"
                className="w-full py-3 px-4 rounded-md border border-border shadow-sm data-[state=active]:border-primary/50 data-[state=active]:border-transparent data-[state=active]:bg-custom-button-green data-[state=active]:text-primary-foreground hover:bg-muted/80 transition-all"
              >
                Bio & Experience
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="certificates"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <CardHeader className="flex items-center">
              All certificates have undergone thorough manual review and have
              been officially approved.
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
              {certificationProp.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  {certificationProp.map((cert) => (
                    <CardContent
                      key={cert.id}
                      className="flex items-center border border-border rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 group min-w-[200px]">
                        <div className="rounded-full bg-emerald-200 p-1">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {cert.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Check className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No certifications yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Certifications will appear here once they have been
                    verified.
                  </p>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent
            value="bio"
            className="mt-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <CardContent className="p-0 sm:p-4 flex-grow overflow-auto">
              <div className="space-y-4">
                {profile?.bio && (
                  <div className="space-y-2">
                    <h3>Bio</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}

                {profile?.experience && (
                  <div className="space-y-2 ">
                    <h3>Experience</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground leading-relaxed">
                        {profile.experience}
                      </p>
                    </div>
                  </div>
                )}

                {!profile?.bio && !profile?.experience && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Check className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">
                      No information available
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      Biographical and experience information will appear here
                      once added.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
