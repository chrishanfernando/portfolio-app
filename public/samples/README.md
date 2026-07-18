# Sample import files

Small examples you can use to see how the importer behaves before uploading your real broker data. All numbers are fabricated.

| File | Format | Use with |
|---|---|---|
| `generic-portfolio-template.csv` | CSV | Manual reference — mirrors what the Excel (`Tx` sheet) importer expects. Not directly importable; convert or use for hand-entry. |
| `cmc-markets-sample.csv` | CMC CSV | `/import` → CMC Markets |
| `swyftx-sample.csv` | Swyftx CSV | `/import` → Swyftx |
| `independent-reserve-sample.csv` | IR CSV | `/import` → Independent Reserve |
| `stake-format-notes.txt` | Guidance | Stake imports require the native XLSX export; this file explains the expected sheet + column layout. |

For your own imports, download the CSV or XLSX from your broker's activity/statement page and upload it directly — no conversion needed.
