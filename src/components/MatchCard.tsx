import { Trophy, Clock, User, Gamepad2 } from "lucide-react";

interface MatchCardProps {
  match: {
    id: string;
    mode: string;
    team1_players: string[];
    team2_players: string[];
    winning_team: number;
    screenshot_url: string | null;
    moderator_name: string;
    created_at: string;
  };
}

const MatchCard = ({ match }: MatchCardProps) => {
  const winningPlayers = match.winning_team === 1 ? match.team1_players : match.team2_players;
  const losingPlayers = match.winning_team === 1 ? match.team2_players : match.team1_players;

  const modeColors: Record<string, string> = {
    "ARAM Hỗn Loạn": "bg-primary/20 text-primary",
    "ARAM Thường": "bg-accent/20 text-accent",
  };

  return (
    <div className="card-gaming p-4 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${modeColors[match.mode] || "bg-secondary text-secondary-foreground"}`}>
            {match.mode}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(match.created_at).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Winning team */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-xs font-gaming text-primary">
            <Trophy className="h-3 w-3" />
            THẮNG
          </div>
          <div className="space-y-1">
            {winningPlayers.map((name) => (
              <p key={name} className="text-sm text-foreground truncate">{name}</p>
            ))}
          </div>
        </div>
        {/* Losing team */}
        <div className="space-y-1.5">
          <div className="text-xs font-gaming text-muted-foreground">THUA</div>
          <div className="space-y-1">
            {losingPlayers.map((name) => (
              <p key={name} className="text-sm text-muted-foreground truncate">{name}</p>
            ))}
          </div>
        </div>
      </div>

      {match.screenshot_url && (
        <img
          src={match.screenshot_url}
          alt="Match screenshot"
          className="rounded-md border border-border w-full h-32 object-cover"
          loading="lazy"
        />
      )}

      <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1 border-t border-border">
        <User className="h-3 w-3" />
        Mod: {match.moderator_name}
      </div>
    </div>
  );
};

export default MatchCard;
