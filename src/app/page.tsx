import { Container, Typography } from "@mui/material";

export const metadata = {
  title: "Kanban Board",
};

export default function KanbanPage() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Kanban Board
      </Typography>
    </Container>
  );
}
