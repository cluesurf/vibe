# P79: Anomaly Cancellation Forces Charge Quantization

**Status: solved (for what it assumes). Anomaly freedom reproduces the exact Standard Model hypercharges.**

## The question

Why are electric charges quantized, the electron exactly minus one, quarks in thirds, atoms
neutral? The Standard Model takes the hypercharges as inputs. The substrate cannot host a gauge
theory that is inconsistent under its own gauge transformations, so its anomalies must cancel,
the same index-theorem requirement behind P8. What does that one requirement buy?

## Result

Assume the gauge group SU(3) x SU(2) x U(1) and one generation of the usual representations, leave
every hypercharge free, and impose only gauge-invariant mass terms and the linear anomaly
conditions. The solution is unique and exactly the Standard Model:

| field | hypercharge | Standard Model |
| ----- | ----------- | -------------- |
| Q | 0.1667 | 1/6 |
| u | -0.6667 | -2/3 |
| d | 0.3333 | 1/3 |
| L | -0.5000 | -1/2 |
| e | 1.0000 | 1 |

The anomalies not used in the solve (the SU(3)^2-U(1) color anomaly and the U(1)^3 cubic anomaly)
then cancel on their own, to 1e-12, a nontrivial check that could have failed. Electric charges
Q = T3 + Y come out quantized in thirds: up +2/3, down -1/3, neutrino 0, electron -1. Proton (uud)
and electron cancel, so atoms are neutral.

## Reading

A single consistency requirement, anomaly freedom, fixes the entire pattern of hypercharges and
forces charge quantization, including the exact electron-proton cancellation the Standard Model
leaves unexplained. We are explicit about the limit: this assumes the gauge group and the
representation content. Deriving those is the work that remains.

## See also

`p8-gauge-fields.md`, `p77-chiral-gauge.md`, `p23-gauge-from-action.md`.
