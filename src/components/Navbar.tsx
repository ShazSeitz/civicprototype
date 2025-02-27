
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { LucideVote, Settings, Menu, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileLayout } from '@/hooks/use-mobile';

type LogoTextProps = {
  showText?: boolean;
};

const LogoText = ({ showText = true }: LogoTextProps) => (
  <div className="flex items-center gap-2">
    <LucideVote className="h-6 w-6" />
    {showText && <span className="font-semibold text-xl">VoteInfo</span>}
  </div>
);

const Navbar = () => {
  const isMobile = useMobileLayout();

  const NavLinks = () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <BadgeCheck className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Voter Information
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Nonpartisan information to help you make informed voting decisions
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="https://www.vote.gov" title="Vote.gov">
                Register to vote and find polling information
              </ListItem>
              <ListItem href="https://www.usa.gov/election" title="USA.gov Elections">
                Official U.S. government information about elections
              </ListItem>
              <ListItem href="https://www.ballotready.org" title="BallotReady">
                Research candidates and issues on your ballot
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link to="/debug">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Debug Tool
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  const MobileMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/">Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/debug">Debug Tool</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="https://www.vote.gov" target="_blank" rel="noopener noreferrer">
            Vote.gov
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="https://www.ballotready.org" target="_blank" rel="noopener noreferrer">
            BallotReady
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Link to="/" className="mr-4 flex items-center">
          <LogoText showText={!isMobile} />
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {!isMobile ? <NavLinks /> : null}
          </div>
          <div className="flex items-center">
            {isMobile ? <MobileMenu /> : null}
          </div>
        </div>
      </div>
    </header>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default Navbar;
