import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Applications from "@/pages/Applications";
import NewApplication from "@/pages/NewApplication";
import ApplicationDetail from "@/pages/ApplicationDetail";
import Policies from "@/pages/Policies";
import PolicyForm from "@/pages/PolicyForm";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      <Route path="/applications" component={Applications} />
      <Route path="/applications/new" component={NewApplication} />
      <Route path="/applications/:id" component={ApplicationDetail} />
      
      <Route path="/policies" component={Policies} />
      <Route path="/policies/new" component={PolicyForm} />
      <Route path="/policies/:id/edit" component={PolicyForm} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Layout>
          <Router />
        </Layout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
