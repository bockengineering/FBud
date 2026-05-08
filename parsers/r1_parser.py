from .base_parser import BudgetParser, ParsedDocument


class R1Parser(BudgetParser):
    document_type = "r1"

    def parse(self, pdf_path: str) -> ParsedDocument:
        raise NotImplementedError("R-1 ingestion is reserved for the next data source.")
