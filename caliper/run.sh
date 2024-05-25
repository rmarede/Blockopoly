node scripts/update-contract-definitions.js

npx caliper launch manager \
    --caliper-bind-sut besu:1.4 \
    --caliper-workspace . \
    --caliper-benchconfig benchmarks/benchmark1.yaml \
    --caliper-networkconfig networks/network-config.json