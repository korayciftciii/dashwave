import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TaskDetailLoading() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Back button skeleton */}
            <div className="flex items-center space-x-2">
                <Skeleton className="h-9 w-32" />
            </div>

            {/* Task header skeleton */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <Skeleton className="h-8 w-64 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Task details skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="details">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="files">Files</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6 pt-4">
                            {/* Description skeleton */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mb-2" />
                                    <Skeleton className="h-4 w-4/6 mb-2" />
                                    <Skeleton className="h-4 w-3/6" />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* People skeleton */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">People</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div>
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div>
                                        <Skeleton className="h-4 w-32 mb-1" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates skeleton */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
} 